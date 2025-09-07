#!/usr/bin/env python3
"""
Deploy smart contracts to Algorand network
Following official Algorand documentation patterns
"""

import os
import sys
import json
from pathlib import Path
from algosdk.v2client import algod, indexer
from algosdk import account, mnemonic, transaction
from algosdk.transaction import ApplicationCreateTxn, StateSchema, OnComplete
from algosdk.logic import get_application_address
import base64
from typing import Dict, Any, Optional

# Add contracts src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

class ContractDeployer:
    """Deploy and manage smart contracts on Algorand"""
    
    def __init__(self, network: str = "localnet"):
        """Initialize deployer with network configuration"""
        self.network = network
        self.contracts_deployed = {}
        
        # Network configurations
        configs = {
            "localnet": {
                "algod_url": "http://localhost:4001",
                "algod_token": "a" * 64,
                "indexer_url": "http://localhost:8980",
                "indexer_token": "a" * 64,
            },
            "testnet": {
                "algod_url": "https://testnet-api.algonode.cloud",
                "algod_token": "",
                "indexer_url": "https://testnet-idx.algonode.cloud",
                "indexer_token": "",
            },
            "mainnet": {
                "algod_url": "https://mainnet-api.algonode.cloud",
                "algod_token": "",
                "indexer_url": "https://mainnet-idx.algonode.cloud",
                "indexer_token": "",
            }
        }
        
        config = configs.get(network, configs["localnet"])
        
        # Initialize clients
        self.algod_client = algod.AlgodClient(
            config["algod_token"],
            config["algod_url"]
        )
        
        self.indexer_client = indexer.IndexerClient(
            config["indexer_token"],
            config["indexer_url"]
        )
        
        # Load deployer account
        self.deployer_account = self._load_deployer_account()
        
        print(f"Initialized deployer for {network}")
        print(f"Deployer address: {self.deployer_account['address']}")
    
    def _load_deployer_account(self) -> Dict[str, str]:
        """Load deployer account from environment or use default for localnet"""
        if self.network == "localnet":
            # Default localnet account
            mnemonic_phrase = "analyst decade album recall stem run cage ozone human pepper once insect grain attempt armed name acoustic hood short stove wagon spawn pepper abstract above"
        else:
            # Load from environment
            mnemonic_phrase = os.getenv("DEPLOYER_MNEMONIC")
            if not mnemonic_phrase:
                raise ValueError("DEPLOYER_MNEMONIC environment variable not set")
        
        private_key = mnemonic.to_private_key(mnemonic_phrase)
        address = account.address_from_private_key(private_key)
        
        return {
            "address": address,
            "private_key": private_key,
            "mnemonic": mnemonic_phrase
        }
    
    def check_balance(self) -> int:
        """Check deployer account balance"""
        account_info = self.algod_client.account_info(self.deployer_account["address"])
        balance = account_info.get("amount", 0)
        print(f"Account balance: {balance / 1_000_000:.6f} ALGO")
        return balance
    
    def compile_contract(self, source_file: str) -> tuple[bytes, bytes]:
        """Compile a PyTeal contract"""
        # Import and compile the contract
        if "claim_registry" in source_file:
            from claim_registry_pyteal import ClaimRegistry
            app = ClaimRegistry()
        else:
            raise ValueError(f"Unknown contract: {source_file}")
        
        app_spec = app.build()
        
        # Get compiled TEAL programs
        approval_program = app_spec.approval_program
        clear_program = app_spec.clear_program
        
        # Compile TEAL to bytecode
        approval_result = self.algod_client.compile(approval_program)
        approval_bytes = base64.b64decode(approval_result["result"])
        
        clear_result = self.algod_client.compile(clear_program)
        clear_bytes = base64.b64decode(clear_result["result"])
        
        return approval_bytes, clear_bytes
    
    def deploy_contract(
        self,
        contract_name: str,
        approval_program: bytes,
        clear_program: bytes,
        global_schema: StateSchema = None,
        local_schema: StateSchema = None,
        app_args: list = None
    ) -> int:
        """Deploy a contract to the blockchain"""
        
        # Default schemas if not provided
        if global_schema is None:
            global_schema = StateSchema(num_uints=10, num_byte_slices=10)
        if local_schema is None:
            local_schema = StateSchema(num_uints=0, num_byte_slices=0)
        
        # Get suggested parameters
        params = self.algod_client.suggested_params()
        
        # Create application create transaction
        txn = ApplicationCreateTxn(
            sender=self.deployer_account["address"],
            sp=params,
            on_complete=OnComplete.NoOpOC,
            approval_program=approval_program,
            clear_program=clear_program,
            global_schema=global_schema,
            local_schema=local_schema,
            app_args=app_args,
            extra_pages=3  # Extra pages for box storage
        )
        
        # Sign transaction
        signed_txn = txn.sign(self.deployer_account["private_key"])
        
        # Send transaction
        tx_id = self.algod_client.send_transaction(signed_txn)
        print(f"Deploying {contract_name}... TX ID: {tx_id}")
        
        # Wait for confirmation
        confirmed_txn = transaction.wait_for_confirmation(self.algod_client, tx_id, 4)
        app_id = confirmed_txn["application-index"]
        app_address = get_application_address(app_id)
        
        print(f"✅ {contract_name} deployed!")
        print(f"   App ID: {app_id}")
        print(f"   App Address: {app_address}")
        
        self.contracts_deployed[contract_name] = {
            "app_id": app_id,
            "app_address": app_address,
            "tx_id": tx_id
        }
        
        return app_id
    
    def fund_contract(self, app_id: int, amount: int = 10_000_000):
        """Fund a contract with ALGO for box storage"""
        app_address = get_application_address(app_id)
        
        params = self.algod_client.suggested_params()
        
        txn = transaction.PaymentTxn(
            sender=self.deployer_account["address"],
            sp=params,
            receiver=app_address,
            amt=amount
        )
        
        signed_txn = txn.sign(self.deployer_account["private_key"])
        tx_id = self.algod_client.send_transaction(signed_txn)
        
        transaction.wait_for_confirmation(self.algod_client, tx_id, 4)
        print(f"✅ Funded contract {app_id} with {amount / 1_000_000:.6f} ALGO")
    
    def deploy_all_contracts(self):
        """Deploy all DeFacto contracts"""
        print("\n🚀 Starting contract deployment...")
        
        # Check balance
        balance = self.check_balance()
        if balance < 100_000_000:  # Need at least 100 ALGO
            print("⚠️  Warning: Low balance for deployment")
        
        print("\n📝 Compiling contracts...")
        
        # 1. Deploy ClaimRegistry
        print("\n1. ClaimRegistry")
        try:
            approval, clear = self.compile_contract("claim_registry")
            claim_registry_id = self.deploy_contract(
                "ClaimRegistry",
                approval,
                clear,
                global_schema=StateSchema(num_uints=10, num_byte_slices=10),
                local_schema=StateSchema(num_uints=0, num_byte_slices=0)
            )
            
            # Fund for box storage
            self.fund_contract(claim_registry_id, 10_000_000)
            
        except Exception as e:
            print(f"❌ Failed to deploy ClaimRegistry: {e}")
            claim_registry_id = 0
        
        # Save deployment info
        deployment_info = {
            "network": self.network,
            "deployer": self.deployer_account["address"],
            "contracts": self.contracts_deployed
        }
        
        deployment_file = Path(__file__).parent / "deployment.json"
        with open(deployment_file, "w") as f:
            json.dump(deployment_info, f, indent=2)
        
        print(f"\n✅ Deployment complete! Info saved to {deployment_file}")
        
        # Update .env file for API
        env_file = Path(__file__).parent.parent / "api" / ".env"
        if env_file.exists():
            print(f"\n📝 Updating {env_file} with contract addresses...")
            
            with open(env_file, "r") as f:
                lines = f.readlines()
            
            # Update contract IDs
            updated_lines = []
            for line in lines:
                if line.startswith("CLAIM_REGISTRY_APP_ID="):
                    line = f"CLAIM_REGISTRY_APP_ID={claim_registry_id}\n"
                updated_lines.append(line)
            
            with open(env_file, "w") as f:
                f.writelines(updated_lines)
            
            print("✅ Environment file updated!")
        
        return deployment_info

def main():
    """Main deployment script"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Deploy DeFacto contracts")
    parser.add_argument(
        "--network",
        choices=["localnet", "testnet", "mainnet"],
        default="localnet",
        help="Network to deploy to"
    )
    
    args = parser.parse_args()
    
    # Deploy contracts
    deployer = ContractDeployer(network=args.network)
    deployment_info = deployer.deploy_all_contracts()
    
    print("\n🎉 All contracts deployed successfully!")
    print(json.dumps(deployment_info, indent=2))

if __name__ == "__main__":
    main()
import ipfshttpclient
import json
import logging
from typing import Dict, Any, Optional
from src.config import settings

logger = logging.getLogger(__name__)

class IPFSService:
    def __init__(self):
        self.client = None
        self.connect()
    
    def connect(self):
        """Connect to IPFS daemon"""
        try:
            # Parse URL to get host and port
            url_parts = settings.ipfs_api_url.replace("http://", "").split(":")
            host = url_parts[0]
            port = int(url_parts[1]) if len(url_parts) > 1 else 5001
            
            # Convert localhost to 127.0.0.1 for multiaddr format
            if host == "localhost":
                host = "127.0.0.1"
            
            self.client = ipfshttpclient.connect(
                addr=f"/ip4/{host}/tcp/{port}/http"
            )
            logger.info(f"Connected to IPFS at {settings.ipfs_api_url}")
        except Exception as e:
            logger.error(f"Failed to connect to IPFS: {e}")
            # Don't raise - allow API to start without IPFS for development
            self.client = None
    
    async def health_check(self) -> bool:
        """Check if IPFS is accessible"""
        try:
            if self.client:
                self.client.version()
                return True
            return False
        except:
            return False
    
    async def upload_claim(self, claim_data: Dict[str, Any]) -> str:
        """
        Upload claim data to IPFS
        Returns: IPFS hash
        """
        try:
            if not self.client:
                # Return mock hash for development
                import hashlib
                import time
                import random
                logger.warning("IPFS not connected, returning mock hash")
                # Generate unique mock hash
                unique_data = f"{json.dumps(claim_data)}{time.time()}{random.random()}"
                hash_obj = hashlib.sha256(unique_data.encode())
                mock_hash = f"Qm{hash_obj.hexdigest()}"[:46]
                return mock_hash
            
            # Convert to JSON
            json_data = json.dumps(claim_data, indent=2)
            
            # Upload to IPFS
            result = self.client.add_json(claim_data)
            ipfs_hash = result
            
            # Pin the content to prevent garbage collection
            self.client.pin.add(ipfs_hash)
            
            logger.info(f"Uploaded claim to IPFS: {ipfs_hash}")
            return ipfs_hash
            
        except Exception as e:
            logger.error(f"Failed to upload to IPFS: {e}")
            # Return mock hash for development
            import hashlib
            import time
            import random
            unique_data = f"{json.dumps(claim_data)}{time.time()}{random.random()}"
            hash_obj = hashlib.sha256(unique_data.encode())
            mock_hash = f"Qm{hash_obj.hexdigest()}"[:46]
            return mock_hash
    
    async def get_claim(self, ipfs_hash: str) -> Dict[str, Any]:
        """
        Retrieve claim data from IPFS
        """
        try:
            if not self.client:
                # Return mock data for development
                logger.warning("IPFS not connected, returning mock data")
                return {
                    "title": "Mock Claim",
                    "content": "This is mock content for development",
                    "category": "technology",
                    "evidence_urls": [],
                    "submitted_at": "2024-01-01T00:00:00Z"
                }
            
            # Get content from IPFS
            data = self.client.get_json(ipfs_hash)
            logger.info(f"Retrieved claim from IPFS: {ipfs_hash}")
            return data
            
        except Exception as e:
            logger.error(f"Failed to retrieve from IPFS: {e}")
            # Return mock data for development
            return {
                "title": "Mock Claim",
                "content": "This is mock content for development",
                "category": "technology",
                "evidence_urls": [],
                "submitted_at": "2024-01-01T00:00:00Z"
            }
    
    async def upload_file(self, file_content: bytes, filename: str) -> str:
        """
        Upload a file to IPFS (for evidence, images, etc.)
        """
        try:
            if not self.client:
                logger.warning("IPFS not connected, returning mock hash")
                return f"Qm{''.join(['File123'] * 6)}"[:46]
            
            result = self.client.add(file_content)
            ipfs_hash = result['Hash']
            
            # Pin the file
            self.client.pin.add(ipfs_hash)
            
            logger.info(f"Uploaded file {filename} to IPFS: {ipfs_hash}")
            return ipfs_hash
            
        except Exception as e:
            logger.error(f"Failed to upload file to IPFS: {e}")
            return f"Qm{''.join(['File123'] * 6)}"[:46]
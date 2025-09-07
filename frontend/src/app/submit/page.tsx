'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/layout/app-shell'
import { useSubmitClaim } from '@/hooks/use-claims'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  Plus, 
  X, 
  AlertCircle, 
  FileText,
  Tag,
  Link as LinkIcon,
  Eye
} from 'lucide-react'
import { AppConfig, Category } from '@/config/app.config'
import { toast } from 'sonner'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { ClaimSubmissionRequest } from '@/types'

// Form validation schema
const claimSchema = z.object({
  title: z.string()
    .min(AppConfig.CLAIM_TITLE_MIN, `Title must be at least ${AppConfig.CLAIM_TITLE_MIN} characters`)
    .max(AppConfig.CLAIM_TITLE_MAX, `Title must be less than ${AppConfig.CLAIM_TITLE_MAX} characters`),
  content: z.string()
    .min(AppConfig.CLAIM_CONTENT_MIN, `Content must be at least ${AppConfig.CLAIM_CONTENT_MIN} characters`)
    .max(AppConfig.CLAIM_CONTENT_MAX, `Content must be less than ${AppConfig.CLAIM_CONTENT_MAX} characters`),
  category: z.enum(['news', 'science', 'politics', 'health', 'technology'] as const),
  evidence_urls: z.array(z.string().url('Please enter a valid URL')).max(AppConfig.MAX_EVIDENCE_URLS).optional()
})

type FormData = z.infer<typeof claimSchema>

const STEPS = [
  { id: 1, title: 'Content', icon: FileText },
  { id: 2, title: 'Category', icon: Tag },
  { id: 3, title: 'Evidence', icon: LinkIcon },
  { id: 4, title: 'Review', icon: Eye }
]

export default function SubmitClaimPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>([''])
  
  const { mutate: submitClaim, isPending } = useSubmitClaim()
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    trigger
  } = useForm<FormData>({
    resolver: zodResolver(claimSchema),
    defaultValues: {
      title: '',
      content: '',
      category: undefined,
      evidence_urls: []
    }
  })
  
  const watchedValues = watch()
  
  // Load saved form data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('claimFormData')
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        setValue('title', parsed.title || '')
        setValue('content', parsed.content || '')
        setValue('category', parsed.category)
        setEvidenceUrls(parsed.evidence_urls || [''])
      } catch (e) {
        console.error('Failed to load saved form data')
      }
    }
  }, [setValue])
  
  // Save form data to localStorage
  useEffect(() => {
    const formData = {
      title: watchedValues.title,
      content: watchedValues.content,
      category: watchedValues.category,
      evidence_urls: evidenceUrls.filter(url => url.trim() !== '')
    }
    localStorage.setItem('claimFormData', JSON.stringify(formData))
  }, [watchedValues, evidenceUrls])
  
  const handleNext = async () => {
    let isValid = true
    
    if (currentStep === 1) {
      isValid = await trigger(['title', 'content'])
    } else if (currentStep === 2) {
      isValid = await trigger('category')
    }
    
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length))
    }
  }
  
  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }
  
  const handleAddEvidenceUrl = () => {
    if (evidenceUrls.length < AppConfig.MAX_EVIDENCE_URLS) {
      setEvidenceUrls([...evidenceUrls, ''])
    }
  }
  
  const handleRemoveEvidenceUrl = (index: number) => {
    setEvidenceUrls(evidenceUrls.filter((_, i) => i !== index))
  }
  
  const handleEvidenceUrlChange = (index: number, value: string) => {
    const newUrls = [...evidenceUrls]
    newUrls[index] = value
    setEvidenceUrls(newUrls)
  }
  
  const onSubmit = (data: FormData) => {
    const filteredUrls = evidenceUrls.filter(url => url.trim() !== '')
    
    const submission: ClaimSubmissionRequest = {
      ...data,
      evidence_urls: filteredUrls.length > 0 ? filteredUrls : undefined
    }
    
    submitClaim(submission, {
      onSuccess: (response) => {
        localStorage.removeItem('claimFormData')
        toast.success('Claim submitted successfully!')
        router.push(`/claims/${response.claim_id}`)
      }
    })
  }
  
  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 mb-4"
            onClick={() => router.push('/')}
          >
            <ArrowLeft className="h-4 w-4" />
            Cancel
          </Button>
          
          <h1 className="text-2xl font-bold">Submit a Claim</h1>
          <p className="text-muted-foreground mt-2">
            Help fight misinformation by submitting claims for community validation
          </p>
        </div>
        
        {/* Progress */}
        <div className="space-y-4">
          <Progress value={(currentStep / STEPS.length) * 100} />
          <div className="flex justify-between">
            {STEPS.map((step) => {
              const Icon = step.icon
              return (
                <div
                  key={step.id}
                  className={`flex flex-col items-center gap-2 ${
                    step.id <= currentStep ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      step.id < currentStep
                        ? 'bg-primary border-primary text-primary-foreground'
                        : step.id === currentStep
                        ? 'border-primary'
                        : 'border-muted-foreground'
                    }`}
                  >
                    {step.id < currentStep ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <span className="text-xs font-medium">{step.title}</span>
                </div>
              )
            })}
          </div>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            {/* Step 1: Title & Content */}
            {currentStep === 1 && (
              <>
                <CardHeader>
                  <CardTitle>Claim Content</CardTitle>
                  <CardDescription>
                    Provide a clear title and detailed description of the claim
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      placeholder="Enter a descriptive title for the claim"
                      {...register('title')}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{errors.title?.message}</span>
                      <span>
                        {watchedValues.title?.length || 0}/{AppConfig.CLAIM_TITLE_MAX}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="content">Content *</Label>
                    <Textarea
                      id="content"
                      placeholder="Provide the full claim content with as much detail as possible"
                      className="min-h-[200px]"
                      {...register('content')}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{errors.content?.message}</span>
                      <span>
                        {watchedValues.content?.length || 0}/{AppConfig.CLAIM_CONTENT_MAX}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </>
            )}
            
            {/* Step 2: Category */}
            {currentStep === 2 && (
              <>
                <CardHeader>
                  <CardTitle>Select Category</CardTitle>
                  <CardDescription>
                    Choose the category that best describes this claim
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={watchedValues.category}
                    onValueChange={(value) => setValue('category', value as Category)}
                  >
                    <div className="space-y-3">
                      {AppConfig.CATEGORIES.map((cat) => (
                        <div
                          key={cat.value}
                          className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent cursor-pointer"
                          onClick={() => setValue('category', cat.value as Category)}
                        >
                          <RadioGroupItem value={cat.value} id={cat.value} />
                          <Label htmlFor={cat.value} className="flex-1 cursor-pointer">
                            <div className="font-medium">{cat.label}</div>
                            <div className="text-xs text-muted-foreground">
                              {cat.value === 'news' && 'Current events and breaking news'}
                              {cat.value === 'science' && 'Scientific discoveries and research'}
                              {cat.value === 'politics' && 'Political statements and policies'}
                              {cat.value === 'health' && 'Medical and health-related claims'}
                              {cat.value === 'technology' && 'Tech innovations and digital topics'}
                            </div>
                          </Label>
                          <Badge
                            variant="secondary"
                            style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                          >
                            {cat.label}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                  {errors.category && (
                    <p className="text-sm text-destructive mt-2">{errors.category.message}</p>
                  )}
                </CardContent>
              </>
            )}
            
            {/* Step 3: Evidence */}
            {currentStep === 3 && (
              <>
                <CardHeader>
                  <CardTitle>Add Evidence (Optional)</CardTitle>
                  <CardDescription>
                    Provide URLs to credible sources that support or relate to this claim
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {evidenceUrls.map((url, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="https://example.com/article"
                        value={url}
                        onChange={(e) => handleEvidenceUrlChange(index, e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveEvidenceUrl(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  {evidenceUrls.length < AppConfig.MAX_EVIDENCE_URLS && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={handleAddEvidenceUrl}
                    >
                      <Plus className="h-4 w-4" />
                      Add Evidence URL
                    </Button>
                  )}
                  
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Evidence URLs help validators verify your claim. Include reputable sources when possible.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </>
            )}
            
            {/* Step 4: Review */}
            {currentStep === 4 && (
              <>
                <CardHeader>
                  <CardTitle>Review Your Claim</CardTitle>
                  <CardDescription>
                    Please review your claim before submitting
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Title</Label>
                      <p className="font-medium">{watchedValues.title}</p>
                    </div>
                    
                    <div>
                      <Label className="text-xs text-muted-foreground">Category</Label>
                      <Badge variant="secondary">
                        {AppConfig.CATEGORIES.find(c => c.value === watchedValues.category)?.label}
                      </Badge>
                    </div>
                    
                    <div>
                      <Label className="text-xs text-muted-foreground">Content</Label>
                      <p className="text-sm whitespace-pre-wrap">{watchedValues.content}</p>
                    </div>
                    
                    {evidenceUrls.filter(url => url.trim() !== '').length > 0 && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Evidence URLs</Label>
                        <ul className="text-sm space-y-1">
                          {evidenceUrls
                            .filter(url => url.trim() !== '')
                            .map((url, index) => (
                              <li key={index} className="text-primary">
                                {url}
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      By submitting this claim, you agree that it will be publicly visible and subject to community validation.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </>
            )}
            
            {/* Navigation */}
            <CardContent className="flex justify-between pt-0">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              {currentStep < STEPS.length ? (
                <Button type="button" onClick={handleNext}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Submit Claim
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </form>
      </div>
    </AppShell>
  )
}
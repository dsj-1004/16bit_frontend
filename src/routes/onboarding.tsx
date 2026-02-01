import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ChevronLeft, Calendar, X } from 'lucide-react'
import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import clsx from 'clsx'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export const Route = createFileRoute('/onboarding')({
  component: OnboardingPage,
})

// --- Schemas & Types ---

// Step 1: Basic Info
const basicInfoSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요'),
  birthDate: z.string().min(1, '생년월일을 선택해주세요'),
  gender: z.enum(['male', 'female'], { required_error: '성별을 선택해주세요' }),
  height: z.string().min(1, '키를 입력해주세요'),
  weight: z.string().min(1, '몸무게를 입력해주세요'),
})

// Step 2: Allergy
// "Yes" means we expect at least one allergy detail or category selected.
// For simplicity, we'll just ask for a list of strings or a text description.
const allergySchema = z
  .object({
    hasAllergy: z.boolean(),
    allergies: z.array(z.string()).optional(),
    otherAllergy: z.string().optional(),
    otherDrug: z.string().optional(),
    otherMedical: z.string().optional(),
    otherFood: z.string().optional(),
  })
  .refine(
    (data) =>
      !data.hasAllergy ||
      (data.allergies && data.allergies.length > 0) ||
      (data.otherAllergy && data.otherAllergy.length > 0) ||
      (data.otherDrug && data.otherDrug.length > 0) ||
      (data.otherMedical && data.otherMedical.length > 0) ||
      (data.otherFood && data.otherFood.length > 0),
    {
      message: '알러지 정보를 입력해주세요',
      path: ['allergies'],
    }
  )

// Step 3: Medication
const medicationDetailSchema = z.object({
  name: z.string().min(1, '약물명을 입력해주세요'),
  dosage: z.string().min(1, '용량을 입력해주세요'),
  frequency: z.string().min(1, '용법을 입력해주세요'),
})

const medicationSchema = z
  .object({
    hasMedication: z.boolean(),
    medications: z.array(medicationDetailSchema).optional(),
  })
  .refine(
    (data) =>
      !data.hasMedication || (data.medications && data.medications.length > 0),
    {
      message: '약물 정보를 입력해주세요',
      path: ['medications'],
    }
  )

// Step 4: Disease
// Step 4: Disease
// diseaseSchema removed as it was unused at runtime. Defining type manually:
type DiseaseData = {
  hasDisease: boolean | null
  diseases?: string[]
  otherDisease?: string
}

type BasicInfoData = z.infer<typeof basicInfoSchema>
type AllergyData = z.infer<typeof allergySchema>
type MedicationData = z.infer<typeof medicationSchema>

type OnboardingStep =
  | 'basic'
  | 'allergy'
  | 'medication'
  | 'disease'
  | 'complete'

const ALLERGY_GROUPS = [
  {
    title: '약물 알레르기',
    required: true,
    items: ['페니실린계', '세팔로스포린계', '아스피린', 'NSAIDs', '기타'],
  },
  {
    title: '검사/의료 관련 알레르기',
    required: true,
    items: ['조영제', '라텍스', '알코올', '기타'],
  },
  {
    title: '식품 알레르기 (급성 반응)',
    required: true,
    items: ['견과류', '갑각류', '계란', '유제품', '복숭아', '기타'],
  },
]

// --- Components ---

function InputLabel({
  label,
  required,
}: {
  label: string
  required?: boolean
}) {
  return (
    <div className="mb-2 flex items-center gap-0.5">
      <span className="text-[14px] font-semibold text-gray-600">{label}</span>
      {required && (
        <span className="text-[14px] font-semibold text-[#FF715B]">*</span>
      )}
    </div>
  )
}

function InputField({
  label,
  required,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  required?: boolean
  error?: string
}) {
  return (
    <div className="flex w-full flex-col">
      {label && <InputLabel label={label} required={required} />}
      <input
        className={clsx(
          'h-[49px] w-full rounded-[10px] border px-4 text-[16px] transition-colors outline-none placeholder:text-gray-300',
          props.error
            ? 'border-[#FF715B]'
            : 'border-[#E5E5E5] focus:border-[#FF715B]'
        )}
        {...props}
      />
      {props.error && (
        <span className="mt-1 text-xs text-[#FF715B]">{props.error}</span>
      )}
    </div>
  )
}

function PrimaryButton({
  children,
  onClick,
  disabled,
  className,
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'flex h-[56px] w-full items-center justify-center rounded-[10px] text-[17px] font-medium transition-colors',
        disabled
          ? 'cursor-not-allowed bg-[#E5E5E5] text-gray-400'
          : 'bg-[#FF715B] text-white hover:opacity-90 active:scale-[0.98]',
        className
      )}
    >
      {children}
    </button>
  )
}

function YesNoSelection({
  question,
  onSelect,
}: {
  question: string
  onSelect: (value: boolean) => void
}) {
  return (
    <div className="flex h-full flex-col">
      <h1 className="mb-12 text-[22px] leading-[1.4] font-bold whitespace-pre-wrap text-[#1C1C1CB2]">
        {question}
      </h1>
      <div className="flex gap-3">
        <button
          onClick={() => onSelect(true)}
          className="h-[56px] w-full rounded-[10px] border border-[#E5E5E5] text-[16px] font-medium text-gray-600 transition-all hover:bg-gray-50 active:scale-[0.98]"
        >
          있어요
        </button>
        <button
          onClick={() => onSelect(false)}
          className="h-[56px] w-full rounded-[10px] border border-[#E5E5E5] text-[16px] font-medium text-gray-600 transition-all hover:bg-gray-50 active:scale-[0.98]"
        >
          없어요
        </button>
      </div>
    </div>
  )
}

// --- Main Page Component ---

function OnboardingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<OnboardingStep>('basic')

  // -- Central State --
  const [onboardingData, setOnboardingData] = useState<
    Partial<BasicInfoData & AllergyData & MedicationData & DiseaseData>
  >({})

  // -- Step 1: Basic Info Logic --
  const {
    register: registerBasic,
    handleSubmit: handleSubmitBasic,
    formState: { errors: errorsBasic, isValid: isValidBasic },
    watch: watchBasic,
    setValue: setValueBasic,
  } = useForm<BasicInfoData>({
    resolver: zodResolver(basicInfoSchema),
    mode: 'onChange',
    defaultValues: {
      name: onboardingData.name || '',
      birthDate: onboardingData.birthDate || '',
      gender: onboardingData.gender || undefined,
      height: onboardingData.height || '',
      weight: onboardingData.weight || '',
    },
  })
  const gender = watchBasic('gender')

  const onNextBasic = (data: BasicInfoData) => {
    console.log('Basic Info:', data)
    setOnboardingData((prev) => ({ ...prev, ...data }))
    setStep('allergy')
  }

  // -- Step 2: Allergy Logic --
  // We use a local state to track if they said "Yes" to show the form, or "No" to auto-advance
  const [showAllergyForm, setShowAllergyForm] = useState(false)
  const {
    register: registerAllergy,
    handleSubmit: handleSubmitAllergy,
    setValue: setValueAllergy,
    watch: watchAllergy,
    formState: { isValid: isValidAllergy },
  } = useForm<AllergyData>({
    resolver: zodResolver(allergySchema),
    defaultValues: { hasAllergy: false, allergies: [] },
  })
  const selectedAllergies = watchAllergy('allergies') || []

  const handleAllergyChoice = (hasAllergy: boolean) => {
    setValueAllergy('hasAllergy', hasAllergy)
    if (hasAllergy) {
      setShowAllergyForm(true)
    } else {
      // No allergy -> Next step directly
      setStep('medication')
    }
  }

  const [isGeneralOtherOpen, setIsGeneralOtherOpen] = useState(false)

  const toggleAllergy = (allergy: string, groupIndex?: number) => {
    const current = selectedAllergies
    let newAllergies = []

    if (current.includes(allergy)) {
      newAllergies = current.filter((a) => a !== allergy)
      // Clear specific input if unselecting "Other"
      if (groupIndex !== undefined) {
        const fieldName = ['otherDrug', 'otherMedical', 'otherFood'][
          groupIndex
        ] as keyof AllergyData
        setValueAllergy(fieldName, '', { shouldValidate: true }) // Clear the text input
      }
    } else {
      newAllergies = [...current, allergy]
    }
    setValueAllergy('allergies', newAllergies, { shouldValidate: true })
  }

  const onNextAllergyForm = (data: AllergyData) => {
    console.log('Allergy Data:', data)
    setOnboardingData((prev) => ({ ...prev, ...data }))
    setStep('medication')
  }

  // -- Step 3: Medication Logic --
  const [showMedicationForm, setShowMedicationForm] = useState(false)
  const {
    control: controlMed,
    register: registerMed,
    handleSubmit: handleSubmitMed,
    setValue: setValueMed,
    watch: watchMed,
    formState: { errors: errorsMed, isValid: isValidMed },
  } = useForm<MedicationData>({
    resolver: zodResolver(medicationSchema),
    defaultValues: {
      hasMedication: false,
      medications: [{ name: '', dosage: '', frequency: '' }],
    },
  })

  const {
    fields: medFields,
    append: appendMed,
    remove: removeMed,
  } = useFieldArray({
    control: controlMed,
    name: 'medications',
  })

  const handleMedicationChoice = (hasMed: boolean) => {
    setValueMed('hasMedication', hasMed)
    if (hasMed) {
      setShowMedicationForm(true)
    } else {
      setStep('disease')
    }
  }

  const onNextMedicationForm = (data: MedicationData) => {
    console.log('Medication Data:', data)
    setOnboardingData((prev) => ({ ...prev, ...data }))
    setStep('disease')
  }

  // -- Step 4: Disease Logic --
  // New schema for dynamic disease inputs
  const diseaseItemSchema = z.object({
    name: z.string().min(1, '질환명을 입력해주세요'),
  })
  const diseaseFormSchema = z
    .object({
      hasDisease: z.boolean().nullable(),
      diseases: z.array(diseaseItemSchema).optional(),
    })
    .refine(
      (data) => {
        if (data.hasDisease === null) return false
        if (data.hasDisease === true) {
          return data.diseases && data.diseases.length > 0
        }
        return true
      },
      {
        message: '질환을 입력해주세요',
        path: ['diseases'],
      }
    )

  type DiseaseFormData = z.infer<typeof diseaseFormSchema>

  const {
    control: controlDisease,
    register: registerDisease,
    handleSubmit: handleSubmitDisease,
    setValue: setValueDisease,
    watch: watchDisease,
    getValues: getValuesDisease,
    formState: { errors: errorsDisease, isValid: isValidDisease },
  } = useForm<DiseaseFormData>({
    resolver: zodResolver(diseaseFormSchema),
    defaultValues: { hasDisease: null, diseases: [{ name: '' }] },
  })

  const {
    fields: diseaseFields,
    append: appendDisease,
    remove: removeDisease,
  } = useFieldArray({
    control: controlDisease,
    name: 'diseases',
  })

  const handleDiseaseChoice = (hasDisease: boolean) => {
    setValueDisease('hasDisease', hasDisease, { shouldValidate: true })
    if (hasDisease) {
      if (getValuesDisease('diseases')?.length === 0) {
        appendDisease({ name: '' })
      }
    } else {
      // If "No", clear diseases to pass validation and advance
      setValueDisease('diseases', [], { shouldValidate: true })
      handleSubmitDisease(onNextDiseaseForm)()
    }
  }

  const onNextDiseaseForm = (data: DiseaseFormData) => {
    console.log('Disease Data:', data)
    const storedData = {
      hasDisease: data.hasDisease,
      diseases: data.diseases?.map((d) => d.name) || [],
      otherDisease: '',
    }
    const finalData = { ...onboardingData, ...storedData }
    setOnboardingData(finalData)

    // Persist to localStorage
    const currentUserStr = localStorage.getItem('user')
    if (currentUserStr) {
      try {
        const currentUser = JSON.parse(currentUserStr)
        const updatedUser = { ...currentUser, ...finalData }
        localStorage.setItem('user', JSON.stringify(updatedUser))
        localStorage.setItem('registeredUser', JSON.stringify(updatedUser))
      } catch (e) {
        console.error('Failed to parse user data during persistence', e)
      }
    }

    setStep('complete')
  }

  // --- Render Functions ---

  const renderProgress = (currentLoopStep: number) => {
    // Steps: Basic(1) -> Allergy(2) -> Medication(3) -> Disease(4)
    return (
      <div className="mb-6 flex gap-[6px]">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={clsx(
              'h-[3px] flex-1 rounded-[5px] transition-colors',
              i <= currentLoopStep ? 'bg-[#333]' : 'bg-[#DEDEDE]'
            )}
          />
        ))}
      </div>
    )
  }

  const renderBasicInfo = () => (
    <div className="flex h-full flex-col overflow-hidden">
      {renderProgress(1)}
      <div className="flex-1 overflow-y-auto pb-[calc(56px+16px+20px)]">
        <h1 className="mb-8 text-[22px] font-semibold tracking-[-0.44px] text-[#292929]">
          기본 정보를 입력해 주세요.
        </h1>

        <div className="flex flex-col gap-6">
          <InputField
            label="이름"
            required
            placeholder="홍길동"
            {...registerBasic('name')}
            error={errorsBasic.name?.message}
          />

          <div className="flex gap-4">
            <div className="min-w-0 flex-[1.5] flex-col">
              <InputLabel label="생년월일" required />
              <div className="relative">
                <input
                  type="date"
                  {...registerBasic('birthDate')}
                  className={clsx(
                    'h-[45px] w-full rounded-[12px] border-[1.5px] px-3 text-[15px] outline-none placeholder:text-[#9D9D9D]',
                    '[&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-date-and-time-value]:text-left',
                    '[&::-webkit-clear-button]:hidden [&::-webkit-inner-spin-button]:appearance-none',
                    errorsBasic.birthDate
                      ? 'border-[#FF715B]'
                      : 'border-[#DDD] focus:border-[#FF715B]'
                  )}
                  style={{
                    WebkitAppearance: 'none',
                  }}
                />
                <Calendar className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-[#9D9D9D]" />
              </div>
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <InputLabel label="성별" required />
              <div className="flex gap-[7px]">
                <button
                  type="button"
                  onClick={() =>
                    setValueBasic('gender', 'male', { shouldValidate: true })
                  }
                  className={clsx(
                    'h-[45px] flex-1 rounded-[12px] border-[1.5px] text-[16px] font-medium transition-colors',
                    gender === 'male'
                      ? 'border-[#FF715B] bg-[#FFF1F0] text-[#FF715B]'
                      : 'border-[#DDD] bg-white text-[#9D9D9D]'
                  )}
                >
                  남
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setValueBasic('gender', 'female', { shouldValidate: true })
                  }
                  className={clsx(
                    'h-[45px] flex-1 rounded-[12px] border-[1.5px] text-[16px] font-medium transition-colors',
                    gender === 'female'
                      ? 'border-[#FF715B] bg-[#FFF1F0] text-[#FF715B]'
                      : 'border-[#DDD] bg-white text-[#9D9D9D]'
                  )}
                >
                  여
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-5">
            <div className="flex-1">
              <InputLabel label="키" required />
              <div className="flex items-center gap-[7px]">
                <input
                  type="number"
                  placeholder="163"
                  {...registerBasic('height')}
                  className={clsx(
                    'h-[45px] w-full rounded-[12px] border-[1.5px] px-4 text-[16px] outline-none',
                    errorsBasic.height
                      ? 'border-[#FF715B]'
                      : 'border-[#DDD] focus:border-[#FF715B]'
                  )}
                />
                <span className="text-[16px] font-medium text-[#9D9D9D]">
                  cm
                </span>
              </div>
            </div>
            <div className="flex-1">
              <InputLabel label="몸무게" required />
              <div className="flex items-center gap-[7px]">
                <input
                  type="number"
                  placeholder="55"
                  {...registerBasic('weight')}
                  className={clsx(
                    'h-[45px] w-full rounded-[12px] border-[1.5px] px-4 text-[16px] outline-none',
                    errorsBasic.weight
                      ? 'border-[#FF715B]'
                      : 'border-[#DDD] focus:border-[#FF715B]'
                  )}
                />
                <span className="text-[16px] font-medium text-[#9D9D9D]">
                  kg
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed right-0 bottom-0 left-0 mx-auto w-full max-w-[375px] bg-white px-5 pt-4 pb-10">
        <PrimaryButton
          onClick={handleSubmitBasic(onNextBasic)}
          disabled={!isValidBasic}
        >
          다음
        </PrimaryButton>
      </div>
    </div>
  )

  const renderAllergy = () => (
    <div className="flex h-full flex-col overflow-hidden">
      {renderProgress(2)}
      {!showAllergyForm ? (
        <YesNoSelection
          question="알러지가 있나요?"
          onSelect={handleAllergyChoice}
        />
      ) : (
        <div className="flex h-full flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto pb-[calc(56px+16px+20px)]">
            <h1 className="mb-8 text-[22px] font-semibold text-[#292929]">
              알러지가 있으신가요?
            </h1>
            <div>
              <div className="mb-8 flex gap-3">
                <button
                  type="button"
                  className="h-[48px] rounded-[10px] border border-[#FF715B] bg-[#FFF1F0] px-6 text-[16px] font-medium text-[#FF715B]"
                >
                  있어요
                </button>
                <button
                  type="button"
                  onClick={() => handleAllergyChoice(false)}
                  className="h-[48px] rounded-[10px] border border-[#E5E5E5] bg-white px-6 text-[16px] font-medium text-gray-600"
                >
                  없어요
                </button>
              </div>

              {ALLERGY_GROUPS.map((group, groupIndex) => {
                const otherValue = `${group.title}-기타`
                const isOtherSelected = selectedAllergies.includes(otherValue)
                const fieldName = ['otherDrug', 'otherMedical', 'otherFood'][
                  groupIndex
                ] as 'otherDrug' | 'otherMedical' | 'otherFood'

                return (
                  <div key={groupIndex} className="mb-8">
                    <InputLabel label={group.title} required={group.required} />
                    <div className="mb-3 flex flex-wrap gap-2">
                      {group.items.map((item) => {
                        const value = item === '기타' ? otherValue : item
                        const isSelected = selectedAllergies.includes(value)

                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() =>
                              toggleAllergy(
                                value,
                                item === '기타' ? groupIndex : undefined
                              )
                            }
                            className={clsx(
                              'rounded-full border px-4 py-2 text-[15px] font-medium transition-all',
                              isSelected
                                ? 'border-[#FF715B] bg-[#FFF1F0] text-[#FF715B]'
                                : 'border-[#E5E5E5] bg-white text-gray-600 hover:bg-gray-50'
                            )}
                          >
                            {item === '기타' ? '기타:' : item}
                          </button>
                        )
                      })}
                    </div>
                    {isOtherSelected && (
                      <input
                        className="animate-in fade-in slide-in-from-top-1 h-[49px] w-full rounded-[10px] border border-[#E5E5E5] px-4 text-[16px] duration-200 outline-none focus:border-[#FF715B]"
                        placeholder={`${group.title} (직접 입력)`}
                        {...registerAllergy(fieldName)}
                      />
                    )}
                  </div>
                )
              })}

              <div className="mb-8">
                <InputLabel label="기타" required />
                {!isGeneralOtherOpen ? (
                  <button
                    type="button"
                    onClick={() => setIsGeneralOtherOpen(true)}
                    className="rounded-full border border-[#E5E5E5] bg-white px-4 py-2 text-[15px] font-medium text-gray-600 transition-colors hover:bg-gray-50"
                  >
                    기타:
                  </button>
                ) : (
                  <input
                    className="animate-in fade-in zoom-in h-[49px] w-full rounded-[10px] border border-[#E5E5E5] px-4 text-[16px] duration-200 outline-none focus:border-[#FF715B]"
                    autoFocus
                    placeholder="기타 알레르기를 입력해주세요"
                    {...registerAllergy('otherAllergy')}
                  />
                )}
              </div>
            </div>
          </div>
          <div className="fixed right-0 bottom-0 left-0 mx-auto w-full max-w-[375px] bg-white px-5 pt-4 pb-10">
            <PrimaryButton
              onClick={handleSubmitAllergy(onNextAllergyForm)}
              disabled={!isValidAllergy}
            >
              다음
            </PrimaryButton>
          </div>
        </div>
      )}
    </div>
  )

  const renderMedication = () => {
    const currentHasMedication = watchMed('hasMedication')

    return (
      <div className="flex h-full flex-col overflow-hidden">
        {renderProgress(3)}
        <div className="flex-1 overflow-y-auto pb-[calc(56px+16px+20px)]">
          <h1 className="mb-8 text-[22px] font-semibold text-[#292929]">
            복용 중인 약이 있으신가요?
          </h1>

          <div className="pb-10">
            {/* Top Toggle */}
            <div className="mb-8 flex gap-3">
              <button
                type="button"
                onClick={() => handleMedicationChoice(true)}
                className={clsx(
                  'h-[48px] flex-1 rounded-[10px] border text-[16px] font-medium transition-colors',
                  currentHasMedication
                    ? 'border-[#FF715B] bg-[#FFF1F0] text-[#FF715B]'
                    : 'border-[#E5E5E5] bg-white text-gray-600'
                )}
              >
                있어요
              </button>
              <button
                type="button"
                onClick={() => handleMedicationChoice(false)}
                className={clsx(
                  'h-[48px] flex-1 rounded-[10px] border text-[16px] font-medium transition-colors',
                  !currentHasMedication
                    ? 'border-[#E5E5E5] bg-white text-gray-600'
                    : 'border-[#E5E5E5] bg-white text-gray-600'
                )}
                style={
                  !currentHasMedication
                    ? {
                        backgroundColor: '#FFF1F0',
                        borderColor: '#FF715B',
                        color: '#FF715B',
                      }
                    : {}
                }
              >
                없어요
              </button>
            </div>

            {/* Form List */}
            {currentHasMedication && (
              <div className="animate-in fade-in slide-in-from-top-2 flex flex-col gap-8 duration-300">
                {medFields.map((field, index) => (
                  <div key={field.id} className="relative flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[15px] font-bold text-[#1C1C1C]">
                        복용약 {index + 1}
                      </h3>
                      {medFields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMed(index)}
                          className="text-gray-400 hover:text-[#FF715B]"
                        >
                          <X size={20} />
                        </button>
                      )}
                    </div>

                    <div>
                      <InputLabel label="복용약 및 용량" required />
                      <div className="flex gap-1.5">
                        <div className="min-w-0 flex-[2]">
                          <input
                            placeholder="약 이름"
                            {...registerMed(
                              `medications.${index}.name` as const
                            )}
                            className={clsx(
                              'h-[42px] w-full rounded-[10px] border px-2 text-[14px] outline-none placeholder:text-gray-300',
                              errorsMed.medications?.[index]?.name
                                ? 'border-[#FF715B]'
                                : 'border-[#E5E5E5] focus:border-[#FF715B]'
                            )}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <input
                            placeholder="용량"
                            {...registerMed(
                              `medications.${index}.dosage` as const
                            )}
                            className={clsx(
                              'h-[42px] w-full rounded-[10px] border px-2 text-[14px] outline-none placeholder:text-gray-300',
                              errorsMed.medications?.[index]?.dosage
                                ? 'border-[#FF715B]'
                                : 'border-[#E5E5E5] focus:border-[#FF715B]'
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <InputLabel label="복용 횟수" required />
                      <Select
                        value={watchMed(`medications.${index}.frequency`)}
                        onValueChange={(value) =>
                          setValueMed(`medications.${index}.frequency`, value, {
                            shouldValidate: true,
                          })
                        }
                      >
                        <SelectTrigger
                          className={clsx(
                            'h-[42px] w-full rounded-[10px] border bg-white px-3 text-[14px]',
                            errorsMed.medications?.[index]?.frequency
                              ? 'border-[#FF715B]'
                              : 'border-[#E5E5E5] focus:border-[#FF715B]'
                          )}
                        >
                          <SelectValue placeholder="선택해주세요" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="하루 1번">하루 1번</SelectItem>
                          <SelectItem value="하루 2번">하루 2번</SelectItem>
                          <SelectItem value="하루 3번">하루 3번</SelectItem>
                          <SelectItem value="필요시 복용">
                            필요시 복용
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    appendMed({ name: '', dosage: '', frequency: '' })
                  }
                  className="flex h-[56px] w-full items-center justify-center rounded-[10px] bg-[#F5F5F5] text-[16px] font-bold text-[#5E5E5E] transition-colors hover:bg-[#EAEAEA]"
                >
                  추가하기
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="fixed right-0 bottom-0 left-0 mx-auto w-full max-w-[375px] bg-white px-5 pt-4 pb-10">
          <PrimaryButton
            onClick={handleSubmitMed(onNextMedicationForm)}
            disabled={!isValidMed && currentHasMedication}
          >
            다음
          </PrimaryButton>
        </div>
      </div>
    )
  }

  const renderDisease = () => {
    const currentHasDisease = watchDisease('hasDisease')

    return (
      <div className="flex h-full flex-col overflow-hidden">
        {renderProgress(4)}
        <div className="flex-1 overflow-y-auto pb-[calc(56px+16px+20px)]">
          <h1 className="mb-8 text-[22px] font-semibold text-[#292929]">
            기저질환이 있으신가요?
          </h1>

          <div className="pb-10">
            {/* Top Toggle */}
            <div className="mb-8 flex gap-3">
              <button
                type="button"
                onClick={() => handleDiseaseChoice(true)}
                className={clsx(
                  'h-[48px] flex-1 rounded-[10px] border text-[16px] font-medium transition-colors',
                  currentHasDisease === true
                    ? 'border-[#FF715B] bg-[#FFF1F0] text-[#FF715B]'
                    : 'border-[#E5E5E5] bg-white text-gray-600'
                )}
              >
                있어요
              </button>
              <button
                type="button"
                onClick={() => handleDiseaseChoice(false)}
                className={clsx(
                  'h-[48px] flex-1 rounded-[10px] border text-[16px] font-medium transition-colors',
                  currentHasDisease === false
                    ? 'border-[#FF715B] bg-[#FF715B] text-white'
                    : 'border-[#E5E5E5] bg-white text-gray-600'
                )}
              >
                없어요
              </button>
            </div>

            {/* Form only if Yes */}
            {currentHasDisease === true && (
              <div className="animate-in fade-in slide-in-from-top-2 flex flex-col gap-6 duration-300">
                {diseaseFields.map((field, index) => (
                  <div key={field.id} className="relative">
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeDisease(index)}
                        className="absolute -top-8 right-0 flex items-center gap-1 pt-2 text-sm text-gray-400 hover:text-[#FF715B]"
                      >
                        <X size={16} />
                      </button>
                    )}

                    <InputLabel label={`기저질환 ${index + 1}`} required />
                    <InputField
                      placeholder="질병 이름"
                      {...registerDisease(`diseases.${index}.name` as const)}
                      error={errorsDisease.diseases?.[index]?.name?.message}
                    />
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => appendDisease({ name: '' })}
                  className="flex h-[56px] w-full items-center justify-center gap-2 rounded-[10px] bg-[#F5F5F5] font-bold text-[#5E5E5E] transition-colors hover:bg-[#EAEAEA]"
                >
                  추가하기
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="fixed right-0 bottom-0 left-0 mx-auto w-full max-w-[375px] bg-white px-5 pt-4 pb-10">
          <PrimaryButton
            onClick={handleSubmitDisease(onNextDiseaseForm)}
            disabled={!isValidDisease && currentHasDisease === true}
          >
            다음
          </PrimaryButton>
        </div>
      </div>
    )
  }

  const renderComplete = () => (
    <div className="animate-in fade-in zoom-in flex h-full flex-col items-center justify-center overflow-hidden duration-300">
      <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto pb-[calc(56px+16px+20px)]">
        {/* Custom Check Icon matching Figma */}
        <div className="relative mb-6">
          <svg
            width="88"
            height="88"
            viewBox="0 0 88 88"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="44" cy="44" r="44" fill="#FF715B" />
            <path
              d="M28 44L39.5 55.5L61.5 33.5"
              stroke="white"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1 className="mb-2 text-center text-[24px] leading-[1.3] font-bold whitespace-pre-wrap text-[#292929]">
          {onboardingData.name ? `${onboardingData.name}님` : '회원님'}
          <br />
          프로필 설정을 완료했어요!
        </h1>
        <p className="mb-10 translate-y-2 text-center text-gray-500">
          이제 내 주변 병원을
          <br />
          편리하게 찾을 수 있어요.
        </p>
      </div>

      <div className="fixed right-0 bottom-0 left-0 mx-auto w-full max-w-[375px] bg-white px-5 pt-4 pb-10">
        <PrimaryButton onClick={() => navigate({ to: '/search-map' })}>
          서비스 시작하기
        </PrimaryButton>
      </div>
    </div>
  )

  const handleBack = () => {
    // Logic for back button depends on substeps (whether form is shown)
    if (step === 'basic') navigate({ to: '/login' })
    else if (step === 'allergy') {
      if (showAllergyForm) setShowAllergyForm(false)
      else setStep('basic')
    } else if (step === 'medication') {
      if (showMedicationForm) setShowMedicationForm(false)
      else setStep('allergy')
    } else if (step === 'disease') {
      // Improved back logic for disease step
      const hasDisease = getValuesDisease('hasDisease')
      if (hasDisease === true) {
        setValueDisease('hasDisease', null) // Clear selection to show toggle again/unselected state
      } else {
        setStep('medication')
      }
    } else if (step === 'complete') setStep('disease')
  }

  return (
    <div className="relative mx-auto flex h-screen w-full max-w-[375px] flex-col overflow-hidden bg-white px-5 pt-7">
      {/* Top Bar */}
      {step !== 'complete' && (
        <div className="mb-2 flex h-[44px] items-center">
          <button
            onClick={handleBack}
            className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-gray-100 active:bg-gray-200"
          >
            <ChevronLeft className="h-6 w-6 text-[#1C1C1CB2]" strokeWidth={2} />
          </button>
        </div>
      )}

      {step === 'basic' && renderBasicInfo()}
      {step === 'allergy' && renderAllergy()}
      {step === 'medication' && renderMedication()}
      {step === 'disease' && renderDisease()}
      {step === 'complete' && renderComplete()}
    </div>
  )
}

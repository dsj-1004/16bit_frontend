import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState, useEffect } from 'react'
import { ChevronLeft, X, Eye, EyeOff, Check } from 'lucide-react'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

const formSchema = z.object({
  email: z.string().email('이메일 형식이 올바르지 않습니다.'),
  password: z
    .string()
    .min(6, '비밀번호는 6자 이상이어야 합니다.')
    .regex(/[A-Z]/, '대문자를 포함해야 합니다.')
    .regex(/[0-9]/, '숫자를 포함해야 합니다.')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, '기호를 포함해야 합니다.'),
})

type FormData = z.infer<typeof formSchema>

interface PasswordRequirement {
  id: string
  label: string
  test: (password: string) => boolean
}

const passwordRequirements: PasswordRequirement[] = [
  { id: 'length', label: '6자이상', test: (pw) => pw.length >= 6 },
  { id: 'uppercase', label: '대문자', test: (pw) => /[A-Z]/.test(pw) },
  { id: 'number', label: '숫자혼합', test: (pw) => /[0-9]/.test(pw) },
  {
    id: 'special',
    label: '기호혼합',
    test: (pw) => /[!@#$%^&*(),.?":{}|<>]/.test(pw),
  },
]

function LoginPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [passwordValue, setPasswordValue] = useState('')
  const [emailTouched, setEmailTouched] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [pendingUserData, setPendingUserData] = useState<FormData | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
  })

  const email = watch('email')
  const password = watch('password')

  useEffect(() => {
    setPasswordValue(password || '')
  }, [password])

  // Removed auto-redirect useEffect to allow access to login page

  const onSubmit = (data: FormData) => {
    // Check if user exists in 'DB' (localStorage registeredUser)
    const storedAccountStr = localStorage.getItem('registeredUser')

    if (storedAccountStr) {
      try {
        const storedAccount = JSON.parse(storedAccountStr)
        if (
          storedAccount.email === data.email &&
          storedAccount.password === data.password
        ) {
          // Login Success
          localStorage.setItem('user', JSON.stringify(storedAccount))
          navigate({ to: '/search-map' })
          return
        }
      } catch {
        // Ignore parse errors
      }
    }

    // If not found or mismatch, treat as new user flow
    setPendingUserData(data)
    setIsModalOpen(true)
  }

  const handleNewUserConfirm = (goToOnboarding: boolean) => {
    if (pendingUserData && goToOnboarding) {
      const userData = {
        ...pendingUserData,
      }

      // Save to 'DB' (Persistent Account)
      localStorage.setItem('registeredUser', JSON.stringify(userData))

      // Save to 'Session' (Current Login)
      localStorage.setItem('user', JSON.stringify(userData))

      navigate({ to: '/onboarding' })
    }
    // If No (goToOnboarding is false), simply close the modal to stay on the page
    setIsModalOpen(false)
  }

  const clearEmail = () => {
    setValue('email', '')
  }

  const clearPassword = () => {
    setValue('password', '')
    setPasswordValue('')
  }

  const getRequirementStatus = (requirement: PasswordRequirement) => {
    if (!passwordValue) return 'inactive'
    return requirement.test(passwordValue) ? 'success' : 'error'
  }

  return (
    <div className="relative mx-auto flex h-screen w-full max-w-[375px] flex-col overflow-hidden bg-white">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-5 pt-7 pb-[calc(56px+41px+20px)]">
        {/* Back Button */}
        <button
          onClick={() => navigate({ to: '/' })}
          className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-gray-100 active:bg-gray-200"
        >
          <ChevronLeft
            className="h-6 w-6 text-[var(--text-primary)]"
            strokeWidth={2}
          />
        </button>

        {/* Form */}
        <form
          id="login-form"
          onSubmit={handleSubmit(onSubmit)}
          className="mt-[40px] flex flex-col"
        >
          {/* Title */}
          <h1 className="mb-12 text-[22px] leading-[26px] font-semibold tracking-[-0.44px] text-[var(--text-primary)]">
            사용자 정보를 입력해주세요
          </h1>

          {/* Information Section */}
          <div className="flex flex-col gap-8">
            {/* Email Field */}
            <div className="flex flex-col gap-[9px]">
              <div className="flex items-center gap-px">
                <label
                  htmlFor="email"
                  className="text-[14px] leading-[14px] font-semibold tracking-[-0.07px] text-[var(--text-secondary)] opacity-80"
                >
                  이메일
                </label>
                <span className="text-[14px] leading-[14px] font-semibold tracking-[-0.07px] text-[var(--brand-primary)]">
                  *
                </span>
              </div>

              <div className="relative">
                <input
                  id="email"
                  type="text"
                  placeholder="IT@gmail.com"
                  {...register('email')}
                  onBlur={() => setEmailTouched(true)}
                  className={`h-[49px] w-full rounded-[10px] border bg-white px-4 text-[16px] leading-[16px] font-normal tracking-[-0.08px] text-[var(--text-tertiary)] placeholder:text-[var(--text-placeholder)] focus:outline-none ${
                    emailTouched && errors.email
                      ? 'border-[var(--brand-error)] focus:border-[var(--brand-error)]'
                      : 'border-[#e5e5e5] focus:border-[var(--brand-primary)]'
                  }`}
                />
                {email && (
                  <button
                    type="button"
                    onClick={clearEmail}
                    className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <div className="rounded-full bg-[#C5C5C5] p-[2px]">
                      <X className="h-3 w-3 text-white" strokeWidth={3} />
                    </div>
                  </button>
                )}
              </div>

              {emailTouched && errors.email && (
                <p className="text-[12px] leading-[12px] font-medium tracking-[-0.06px] text-[var(--brand-error)] opacity-80">
                  * {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-[9px]">
              <div className="flex items-center gap-px">
                <label
                  htmlFor="password"
                  className="text-[14px] leading-[14px] font-semibold tracking-[-0.07px] text-[var(--text-secondary)] opacity-80"
                >
                  비밀번호
                </label>
                <span className="text-[14px] leading-[14px] font-semibold tracking-[-0.07px] text-[var(--brand-primary)]">
                  *
                </span>
              </div>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="비밀번호"
                  {...register('password')}
                  className={`h-[49px] w-full rounded-[10px] border bg-white px-4 pr-[68px] text-[16px] leading-[16px] font-normal tracking-[-0.08px] text-[var(--text-tertiary)] placeholder:text-[var(--text-placeholder)] focus:outline-none ${'border-[#e5e5e5] focus:border-[var(--brand-primary)]'}`}
                />
                <div className="absolute top-1/2 right-4 flex -translate-y-1/2 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="flex items-center justify-center text-[var(--text-placeholder)] hover:text-[var(--text-tertiary)]"
                  >
                    {showPassword ? (
                      <Eye className="h-6 w-6" strokeWidth={1.5} />
                    ) : (
                      <EyeOff className="h-6 w-6" strokeWidth={1.5} />
                    )}
                  </button>
                  {password && (
                    <button
                      type="button"
                      onClick={clearPassword}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <div className="rounded-full bg-[#C5C5C5] p-[2px]">
                        <X className="h-3 w-3 text-white" strokeWidth={3} />
                      </div>
                    </button>
                  )}
                </div>
              </div>

              {/* Password Requirements */}
              <div className="flex flex-wrap items-center gap-3">
                {passwordRequirements.map((requirement) => {
                  const status = getRequirementStatus(requirement)
                  return (
                    <div
                      key={requirement.id}
                      className="flex items-center gap-[2px]"
                    >
                      <span
                        className={`text-[12px] leading-[12px] font-medium tracking-[-0.06px] opacity-80 ${
                          status === 'success'
                            ? 'text-[var(--brand-success)]'
                            : status === 'error'
                              ? 'text-[var(--brand-error)]'
                              : 'text-[var(--text-secondary)]'
                        }`}
                      >
                        {requirement.label}
                      </span>
                      {status !== 'inactive' && (
                        <Check
                          className={`h-3 w-3 ${status === 'success' ? 'text-[var(--brand-success)]' : 'text-[var(--brand-error)]'}`}
                          strokeWidth={4}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Fixed Bottom Button Container */}
      <div className="fixed right-0 bottom-0 left-0 mx-auto w-full max-w-[375px] bg-white px-5 pt-4 pb-[41px]">
        <button
          type="submit"
          form="login-form"
          disabled={!isValid}
          className={`h-[56px] w-full rounded-[10px] text-[17px] font-medium transition-all ${
            isValid
              ? 'bg-[var(--brand-primary)] text-white hover:opacity-90 active:scale-[0.98]'
              : 'cursor-not-allowed bg-[#e5e5e5] text-[var(--text-disabled)]'
          }`}
          onClick={handleSubmit(onSubmit)}
        >
          시작하기
        </button>
      </div>

      {/* New Member Modal */}
      {isModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="animate-fade-in flex w-[293px] flex-col overflow-hidden rounded-[14px] bg-white text-center shadow-lg">
            <div className="px-5 pt-[24px] pb-[16px]">
              <p className="text-[16px] leading-[25.6px] font-normal tracking-[-0.32px] whitespace-pre-wrap text-[#454545]">
                신규 회원이시네요!{'\n'}회원 정보를 입력해주세요
              </p>
            </div>
            <div className="flex gap-[9px] px-[20px] pb-[20px]">
              <button
                onClick={() => handleNewUserConfirm(false)}
                className="h-[43px] flex-1 rounded-[10px] bg-[#3A3A49] text-[14px] font-semibold text-white transition-colors hover:bg-[#2a2a39] active:bg-[#1a1a29]"
              >
                아니오
              </button>
              <button
                onClick={() => handleNewUserConfirm(true)}
                className="h-[43px] flex-1 rounded-[10px] bg-[var(--brand-primary)] text-[14px] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
              >
                네
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

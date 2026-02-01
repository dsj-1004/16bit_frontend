import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState, useEffect } from 'react'

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

  const onSubmit = (data: FormData) => {
    // Check if user exists in localStorage
    const existingUser = localStorage.getItem('user')

    if (existingUser) {
      const user = JSON.parse(existingUser)
      // Simple validation: check if email and password match
      if (user.email === data.email && user.password === data.password) {
        // Login successful - go to main page
        localStorage.setItem('isAuthenticated', 'true')
        navigate({ to: '/' })
      } else {
        alert('이메일 또는 비밀번호가 일치하지 않습니다.')
      }
    } else {
      // New user - save to localStorage and go to onboarding
      localStorage.setItem('user', JSON.stringify(data))
      localStorage.setItem('isAuthenticated', 'true')
      navigate({ to: '/onboarding' })
    }
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
    <div className="relative mx-auto flex h-screen w-full max-w-[375px] flex-col bg-white px-5 pt-7">
      {/* Back Button */}
      <button
        onClick={() => navigate({ to: '/' })}
        className="flex h-5 w-5 items-center justify-center"
      >
        <img
          src="/assets/back-arrow.svg"
          alt="뒤로가기"
          className="h-[19px] w-[11px]"
        />
      </button>

      {/* Form */}
      <form
        id="login-form"
        onSubmit={handleSubmit(onSubmit)}
        className="mt-[52px] flex flex-col"
      >
        {/* Title */}
        <h1 className="mb-12 text-[22px] leading-[26px] font-semibold tracking-[-0.44px] text-[--text-primary]">
          사용자 정보를 입력해주세요
        </h1>

        {/* Information Section */}
        <div className="flex flex-col gap-8">
          {/* Email Field */}
          <div className="flex flex-col gap-[9px]">
            <div className="flex items-center gap-[1px]">
              <label
                htmlFor="email"
                className="text-[14px] leading-[14px] font-semibold tracking-[-0.07px] text-[--text-secondary] opacity-80"
              >
                이름
              </label>
              <span className="text-[14px] leading-[14px] font-semibold tracking-[-0.07px] text-[--brand-primary]">
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
                className="h-[49px] w-full rounded-[10px] border border-[#e5e5e5] bg-white px-4 text-[16px] leading-[16px] font-normal tracking-[-0.08px] text-[--text-tertiary] placeholder:text-[--text-placeholder] focus:border-[--brand-primary] focus:outline-none"
              />
              {email && (
                <button
                  type="button"
                  onClick={clearEmail}
                  className="absolute top-1/2 right-4 -translate-y-1/2"
                >
                  <img
                    src="/assets/clear-icon.svg"
                    alt="지우기"
                    className="h-[15px] w-[15px]"
                  />
                </button>
              )}
            </div>

            {emailTouched && errors.email && (
              <p className="text-[12px] leading-[12px] font-medium tracking-[-0.06px] text-[--brand-error] opacity-80">
                * {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-[9px]">
            <div className="flex items-center gap-[1px]">
              <label
                htmlFor="password"
                className="text-[14px] leading-[14px] font-semibold tracking-[-0.07px] text-[--text-secondary] opacity-80"
              >
                비밀번호
              </label>
              <span className="text-[14px] leading-[14px] font-semibold tracking-[-0.07px] text-[--brand-primary]">
                *
              </span>
            </div>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="비밀번호"
                {...register('password')}
                className="h-[49px] w-full rounded-[10px] border border-[#e5e5e5] bg-white px-4 pr-[68px] text-[16px] leading-[16px] font-normal tracking-[-0.08px] text-[--text-tertiary] placeholder:text-[--text-placeholder] focus:border-[--brand-primary] focus:outline-none"
              />
              <div className="absolute top-1/2 right-4 flex -translate-y-1/2 items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="flex h-[23px] w-[24px] items-center justify-center"
                >
                  <img
                    src={
                      showPassword
                        ? '/assets/eye-show.svg'
                        : '/assets/eye-hide.svg'
                    }
                    alt={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                    className="h-full w-full"
                  />
                </button>
                {password && (
                  <button type="button" onClick={clearPassword}>
                    <img
                      src="/assets/clear-icon.svg"
                      alt="지우기"
                      className="h-[15px] w-[15px]"
                    />
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
                          ? 'text-[--brand-success]'
                          : status === 'error'
                            ? 'text-[--brand-error]'
                            : 'text-[--text-secondary]'
                      }`}
                    >
                      {requirement.label}
                    </span>
                    {status !== 'inactive' && (
                      <img
                        src={
                          status === 'success'
                            ? '/assets/check-success.svg'
                            : '/assets/check-error.svg'
                        }
                        alt={status === 'success' ? '충족' : '미충족'}
                        className="h-[6px] w-[8px]"
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </form>

      {/* Submit Button */}
      <button
        type="submit"
        form="login-form"
        disabled={!isValid}
        className={`absolute right-5 bottom-[41px] left-5 h-[56px] rounded-[10px] text-[17px] font-medium transition-all ${
          isValid
            ? 'bg-[--brand-primary] text-white hover:bg-[--brand-primary]/90 active:scale-[0.98]'
            : 'cursor-not-allowed bg-[#e5e5e5] text-[--text-disabled]'
        }`}
        onClick={handleSubmit(onSubmit)}
      >
        시작하기
      </button>
    </div>
  )
}

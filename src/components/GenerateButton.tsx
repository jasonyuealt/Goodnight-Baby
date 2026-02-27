import { Sparkles, RefreshCw, Loader2 } from 'lucide-react'
import type { GenerationState } from '../types'

interface Props {
  state: GenerationState
  onGenerate: () => void
}

export function GenerateButton({ state, onGenerate }: Props) {
  const isLoading = state === 'loading' || state === 'streaming'
  const isComplete = state === 'complete'
  const isError = state === 'error'

  return (
    <div className="px-6 pb-safe-bottom py-4">
      <button
        onClick={onGenerate}
        disabled={isLoading}
        className={`
          w-full flex items-center justify-center gap-2.5
          py-4 rounded-2xl text-base font-semibold
          transition-all duration-300 ease-out cursor-pointer
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-peach-400
          ${isLoading
            ? 'bg-white/40 backdrop-blur-md text-text-muted border border-white/50 cursor-not-allowed'
            : isComplete
              ? 'bg-white/40 backdrop-blur-md text-lilac-400 border border-white/50 hover:bg-white/55 active:scale-[0.98] shadow-sm'
              : isError
                ? 'bg-white/40 backdrop-blur-md text-text-secondary border border-white/50 hover:bg-white/55 active:scale-[0.98] shadow-sm'
                : 'bg-gradient-to-r from-peach-400 to-peach-300 text-white backdrop-blur-sm hover:from-peach-500 hover:to-peach-400 active:scale-[0.98] shadow-lg animate-glow-soft'
          }
        `}
        aria-label={
          isLoading ? '正在生成中' :
          isComplete ? '换一篇' :
          isError ? '重试' :
          '生成今晚的内容'
        }
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>正在生成...</span>
          </>
        ) : isComplete ? (
          <>
            <RefreshCw className="w-4 h-4" />
            <span>换一篇</span>
          </>
        ) : isError ? (
          <>
            <RefreshCw className="w-4 h-4" />
            <span>重试</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            <span>生成今晚的内容</span>
          </>
        )}
      </button>
    </div>
  )
}

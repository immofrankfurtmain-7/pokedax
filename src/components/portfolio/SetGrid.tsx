'use client'
// src/components/portfolio/SetGrid.tsx

import { useRouter } from 'next/navigation'

interface SetWithProgress {
  id: string
  name: string
  series?: string
  total?: number
  logo_url?: string
  symbol_url?: string
  owned: number
  completion: number
}

interface Props {
  sets: SetWithProgress[]
}

export default function SetGrid({ sets }: Props) {
  const router = useRouter()

  // Nach Serie gruppieren
  const grouped = sets.reduce((acc, set) => {
    const series = set.series || 'Sonstige'
    if (!acc[series]) acc[series] = []
    acc[series].push(set)
    return acc
  }, {} as Record<string, SetWithProgress[]>)

  return (
    <div className="space-y-10">
      {Object.entries(grouped).map(([series, seriesSets]) => (
        <div key={series}>
          <h3 className="text-lg font-semibold text-purple-400 mb-4 border-b border-purple-900 pb-2">
            {series}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {seriesSets.map(set => (
              <div
                key={set.id}
                onClick={() => router.push(`/dashboard/portfolio/${set.id}`)}
                className="cursor-pointer group relative bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-yellow-400 hover:bg-gray-800 transition-all duration-200"
              >
                {/* Completion Badge */}
                {set.completion === 100 && (
                  <div className="absolute top-2 right-2 bg-yellow-400 text-black text-xs font-bold px-2 py-0.5 rounded-full">
                    ✓
                  </div>
                )}

                {/* Logo */}
                <div className="h-12 flex items-center justify-center mb-3">
                  {set.logo_url ? (
                    <img
                      src={set.logo_url}
                      alt={set.name}
                      className="max-h-12 max-w-full object-contain group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="text-gray-600 text-xs text-center">{set.name}</div>
                  )}
                </div>

                {/* Name */}
                <p className="text-white text-xs font-medium text-center mb-2 leading-tight">
                  {set.name}
                </p>

                {/* Fortschritt */}
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{set.owned}/{set.total}</span>
                    <span>{set.completion}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        set.completion === 100
                          ? 'bg-yellow-400'
                          : set.completion > 50
                          ? 'bg-cyan-400'
                          : 'bg-purple-500'
                      }`}
                      style={{ width: `${set.completion}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

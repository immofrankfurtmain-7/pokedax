'use client'
// src/components/portfolio/CollectionStats.tsx

interface Props {
  totalCards: number
  totalSets: number
  completedSets: number
}

export default function CollectionStats({ totalCards, totalSets, completedSets }: Props) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
        <div className="text-3xl font-bold text-yellow-400">{totalCards.toLocaleString()}</div>
        <div className="text-gray-400 text-sm mt-1">Karten gesammelt</div>
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
        <div className="text-3xl font-bold text-cyan-400">{totalSets}</div>
        <div className="text-gray-400 text-sm mt-1">Sets verfügbar</div>
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
        <div className="text-3xl font-bold text-purple-400">{completedSets}</div>
        <div className="text-gray-400 text-sm mt-1">Sets vervollständigt</div>
      </div>
    </div>
  )
}

interface TQIScoreProps {
  score: number;
}

export default function TQIScore({ score }: TQIScoreProps) {
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    return 'Fair';
  };

  return (
    <div className={`px-3 py-1 rounded-full font-semibold text-sm ${getScoreColor(score)}`}>
      TQI: {score} - {getScoreLabel(score)}
    </div>
  );
}
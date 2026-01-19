import { useState } from 'react';
import { HelpCircle, CheckCircle, XCircle, Trophy, Zap } from 'lucide-react';
import Confetti from './Confetti';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: 'Gehört eine fettige Pizzaschachtel ins Altpapier?',
    options: ['Ja, immer', 'Nein, in den Restmüll', 'Nur wenn sie sauber ist'],
    correctAnswer: 1,
    explanation:
      'Richtig! Fettige Pizzaschachteln gehören in den Restmüll, weil das Fett das Papier verschmutzt und nicht mehr recycelt werden kann. Saubere Kartons dürfen aber ins Altpapier!',
  },
  {
    id: 2,
    question: 'Was passiert mit recycelten Plastikflaschen?',
    options: [
      'Sie werden weggeworfen',
      'Daraus werden neue Produkte wie Jacken oder neue Flaschen',
      'Sie werden verbrannt',
    ],
    correctAnswer: 1,
    explanation:
      'Super! Aus recycelten Plastikflaschen können viele neue Dinge entstehen: neue Flaschen, Fleecejacken, Taschen, Spielzeug und vieles mehr. Das spart Rohstoffe und Energie!',
  },
  {
    id: 3,
    question: 'Warum ist Mülltrennung so wichtig?',
    options: [
      'Damit es ordentlich aussieht',
      'Damit das Recycling leichter wird und mehr Material wiederverwendet werden kann',
      'Das ist gar nicht wichtig',
    ],
    correctAnswer: 1,
    explanation:
      'Genau! Je besser wir unseren Müll trennen, desto mehr kann recycelt werden. Das schützt die Umwelt, spart Energie und Rohstoffe. Du bist ein echter Recycling-Held!',
  },
];

interface QuizSectionProps {
  profileId?: string;
  onQuizComplete?: (correctAnswers: number, points: number) => void;
}

export default function QuizSection({
  profileId,
  onQuizComplete,
}: QuizSectionProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleAnswerClick = (answerIndex: number) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(answerIndex);
    setShowResult(true);

    const isCorrect =
      answerIndex === quizQuestions[currentQuestion].correctAnswer;

    if (isCorrect) {
      setScore(score + 1);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setQuizCompleted(false);
  };

  const handleQuizFinish = () => {
    const points = score * 10;
    if (profileId && onQuizComplete) {
      onQuizComplete(score, points);
    }
    setQuizCompleted(true);
  };

  if (quizCompleted) {
    return (
      <section className="py-16 px-4 bg-gradient-to-b from-white to-green-50">
        <div className="container mx-auto max-w-3xl">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center">
            <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Trophy className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Quiz abgeschlossen!
            </h2>
            <p className="text-5xl font-bold text-green-600 mb-6">
              {score} / {quizQuestions.length}
            </p>
            <p className="text-xl text-gray-600 mb-8">
              {score === quizQuestions.length
                ? '🎉 Perfekt! Du bist ein echter Recycling-Experte!'
                : score >= 2
                  ? '👍 Super gemacht! Du weißt schon viel über Recycling!'
                  : '💪 Gut versucht! Übe noch ein bisschen und du wirst zum Recycling-Helden!'}
            </p>
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center gap-2 text-green-700 font-bold text-lg">
                <Zap className="w-6 h-6" />
                +{score * 10} Punkte!
              </div>
            </div>
            <button
              onClick={restartQuiz}
              className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Nochmal versuchen
            </button>
          </div>
        </div>
      </section>
    );
  }

  const question = quizQuestions[currentQuestion];

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-white to-green-50">
      {showConfetti && <Confetti />}
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full mb-4">
            <HelpCircle className="w-5 h-5" />
            <span className="font-semibold">Recycling-Quiz</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Teste dein Wissen!
          </h2>
          <p className="text-gray-600">
            Frage {currentQuestion + 1} von {quizQuestions.length}
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
          <div className="mb-4">
            <div className="flex gap-2 mb-6">
              {quizQuestions.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                    index <= currentQuestion ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>

          <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-8">
            {question.question}
          </h3>

          <div className="space-y-4 mb-8">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === question.correctAnswer;
              const showCorrect = showResult && isCorrect;
              const showIncorrect = showResult && isSelected && !isCorrect;

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerClick(index)}
                  disabled={selectedAnswer !== null}
                  className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 ${
                    showCorrect
                      ? 'bg-green-50 border-green-500'
                      : showIncorrect
                        ? 'bg-red-50 border-red-500'
                        : isSelected
                          ? 'bg-blue-50 border-blue-500'
                          : 'bg-gray-50 border-gray-200 hover:border-green-300 hover:bg-green-50'
                  } ${selectedAnswer !== null ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium text-gray-800">
                      {option}
                    </span>
                    {showCorrect && (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    )}
                    {showIncorrect && (
                      <XCircle className="w-6 h-6 text-red-600" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {showResult && (
            <div
              className={`p-6 rounded-2xl mb-6 animate-fadeIn ${
                selectedAnswer === question.correctAnswer
                  ? 'bg-green-50 border-2 border-green-200'
                  : 'bg-blue-50 border-2 border-blue-200'
              }`}
            >
              <p className="text-gray-700 leading-relaxed">
                {question.explanation}
              </p>
            </div>
          )}

          {showResult && (
            <button
              onClick={() => {
                if (currentQuestion < quizQuestions.length - 1) {
                  handleNextQuestion();
                } else {
                  handleQuizFinish();
                }
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              {currentQuestion < quizQuestions.length - 1
                ? 'Nächste Frage'
                : 'Ergebnis anzeigen'}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

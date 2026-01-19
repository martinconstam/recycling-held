import { useState, useEffect } from 'react';
import { HelpCircle, CheckCircle, XCircle, Trophy, Zap, ArrowUp } from 'lucide-react';
import Confetti from './Confetti';

interface QuizQuestion {
  id: number;
  topicId: number; // 1: Sammeln, 2: Sortieren, 3: Aufbereiten, 4: Neues Produkt
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const allQuizQuestions: QuizQuestion[] = [
  // THEMA 1: SAMMELN
  {
    id: 101,
    topicId: 1,
    question: 'Wohin gehört der Kassenbon aus dem Supermarkt?',
    options: ['Ins Altpapier', 'In den Restmüll', 'In den Biomüll'],
    correctAnswer: 1,
    explanation: 'Kassenzettel sind oft aus Thermopapier beschichtet. Das gehört leider nicht ins Altpapier, sondern in den Restmüll!',
  },
  {
    id: 102,
    topicId: 1,
    question: 'Darf blaues Glas in den Grünglas-Container?',
    options: ['Nein, das ist verboten', 'Ja, das gehört zum Grünglas', 'Nein, es gehört in den Restmüll'],
    correctAnswer: 1,
    explanation: 'Richtig! Wenn es keinen extra Container für blaues Glas gibt, gehört es immer zum Grünglas (nicht zum Weißglas!).',
  },
  {
    id: 103,
    topicId: 1,
    question: 'Wie entsorgst du leere Batterien richtig?',
    options: ['In den Restmüll', 'In die Gelbe Tonne', 'In Sammelboxen im Supermarkt'],
    correctAnswer: 2,
    explanation: 'Batterien enthalten wertvolle aber auch gefährliche Stoffe. Sie müssen in spezielle Sammelboxen im Handel zurückgegeben werden.',
  },
  {
    id: 104,
    topicId: 1,
    question: 'Solltest du den Aludeckel vom Joghurtbecher abtrennen?',
    options: ['Ja, unbedingt', 'Nein, das ist egal', 'Nur wenn er schmutzig ist'],
    correctAnswer: 0,
    explanation: 'Ja! Die Sortiermaschine kann Aluminium und Plastik nur getrennt erkennen. Wenn sie zusammenkleben, wird es schwierig.',
  },
  {
    id: 105,
    topicId: 1,
    question: 'Gehört ein zerbrochenes Trinkglas in den Glascontainer?',
    options: ['Ja, klar', 'Nein, in den Restmüll', 'In den Gelben Sack'],
    correctAnswer: 1,
    explanation: 'Überraschung! Trinkgläser haben eine andere Schmelztemperatur als Flaschen. Sie gehören in den Restmüll, nicht in den Glascontainer.',
  },

  // THEMA 2: SORTIEREN
  {
    id: 201,
    topicId: 2,
    question: 'Wie fischt die Sortiermanlage Eisen und Dosen heraus?',
    options: ['Mit großen Greifarmen', 'Mit riesigen Magneten', 'Mit einem Sieb'],
    correctAnswer: 1,
    explanation: 'Starke Magnete ziehen alles an, was magnetisch ist (wie Weißblechdosen) und heben es vom Förderband.',
  },
  {
    id: 202,
    topicId: 2,
    question: 'Wie erkennen moderne Anlagen verschiedene Plastikarten?',
    options: ['Durch Infrarot-Scanner (Licht)', 'Durch Wiegen', 'Durch Riechen'],
    correctAnswer: 0,
    explanation: 'Nah-Infrarot-Scanner bestrahlen den Müll. Jede Plastiksorte reflektiert das Licht anders. So weiß die Maschine: Das ist PET, das ist PP!',
  },
  {
    id: 203,
    topicId: 2,
    question: 'Wofür werden Luftdüsen in der Sortieranlage genutzt?',
    options: ['Zur Kühlung', 'Um leichte Folien wegzupusten', 'Um den Müll zu trocknen'],
    correctAnswer: 1,
    explanation: 'Druckluft schießt gezielt leichte Materialien wie Folien oder das erkannte Plastik in den richtigen Schacht.',
  },
  {
    id: 204,
    topicId: 2,
    question: 'Was passiert mit "Fehlwürfen" (z.B. eine Windel im Gelben Sack)?',
    options: ['Sie werden aussortiert und verbrannt', 'Sie werden trotzdem recycelt', 'Die Maschine explodiert'],
    correctAnswer: 0,
    explanation: 'Fehlwürfe stören den Prozess enorm. Sie müssen aufwendig aussortiert werden und landen am Ende meist in der Verbrennung.',
  },
  {
    id: 205,
    topicId: 2,
    question: 'Warum ist die "Siebtrommel" wichtig?',
    options: ['Sie wäscht den Müll', 'Sie sortiert nach Größe', 'Sie macht Musik'],
    correctAnswer: 1,
    explanation: 'Eine riesige drehende Trommel mit Löchern sortiert den Abfall grob nach Größe: Kleines fällt durch, Großes wandert weiter.',
  },

  // THEMA 3: AUFBEREITEN
  {
    id: 301,
    topicId: 3,
    question: 'Was passiert mit Plastikflaschen beim Aufbereiten zuerst?',
    options: ['Sie werden bemalt', 'Sie werden geschreddert (zerkleinert)', 'Sie werden eingefroren'],
    correctAnswer: 1,
    explanation: 'Die Flaschen werden in winzige Schnipsel zerhäckselt. Diese nennt man "Flakes".',
  },
  {
    id: 302,
    topicId: 3,
    question: 'Warum müssen die Kunststoff-Flakes gewaschen werden?',
    options: ['Damit sie gut riechen', 'Um Etiketten und Leim zu entfernen', 'Damit sie weicher werden'],
    correctAnswer: 1,
    explanation: 'Beim Waschen lösen sich Papieretiketten, Klebereste und Getränkerückstände vom Plastik.',
  },
  {
    id: 303,
    topicId: 3,
    question: 'Wie wird aus altem Papier neues Papier?',
    options: ['Es wird gebügelt', 'Es wird in Wasser zu einem Brei aufgelöst', 'Es wird geschmolzen'],
    correctAnswer: 1,
    explanation: 'Altpapier wird in riesigen Bottichen mit Wasser vermischt. Es entsteht ein Faserbrei (Pulpe), aus dem neues Papier geschöpft wird.',
  },
  {
    id: 304,
    topicId: 3,
    question: 'Was ist beim Einschmelzen von Glas das Problem bei bunten Farben?',
    options: ['Es gibt kein Problem', 'Gefärbte Scherben lassen sich nicht mehr entfärben', 'Buntes Glas schmilzt nicht'],
    correctAnswer: 1,
    explanation: 'Einmal gefärbtes Glas bleibt farbig. Deshalb darf man KEIN farbiges Glas in den Weißglas-Container werfen!',
  },
  {
    id: 305,
    topicId: 3,
    question: 'Was entsteht, wenn man die Plastik-Flakes erhitzt?',
    options: ['Neues Gas', 'Granulat (kleine Kügelchen)', 'Staub'],
    correctAnswer: 1,
    explanation: 'Das geschmolzene Plastik wird durch sieb-artige Düsen gepresst und zu kleinem Granulat geschnitten. Das ist der Rohstoff für Neues!',
  },

  // THEMA 4: NEUES PRODUKT
  {
    id: 401,
    topicId: 4,
    question: 'Was kann aus alten PET-Flaschen hergestellt werden?',
    options: ['Autoreifen', 'Fleece-Pullis und Sporttrikots', 'Glasflaschen'],
    correctAnswer: 1,
    explanation: 'Die Fasern aus PET-Flaschen sind super für Kleidung! Viele Fleece-Jacken bestehen aus altem Plastik.',
  },
  {
    id: 402,
    topicId: 4,
    question: 'Wie oft kann Glas recycelt werden?',
    options: ['Nur 10 mal', 'Gar nicht', 'Beliebig oft (unendlich)'],
    correctAnswer: 2,
    explanation: 'Glas ist toll! Man kann es immer wieder einschmelzen, ohne dass die Qualität schlechter wird.',
  },
  {
    id: 403,
    topicId: 4,
    question: 'Was ist "Downcycling"?',
    options: ['Wenn man Müll den Berg runterwirft', 'Wenn aus dem Material etwas Minderwertiges wird', 'Wenn das Recycling besonders schnell geht'],
    correctAnswer: 1,
    explanation: 'Beim Plastik wird die Qualität oft schlechter. Aus einer hochwertigen Flasche wird vielleicht "nur" eine Parkbank oder ein Blumenkübel.',
  },
  {
    id: 404,
    topicId: 4,
    question: 'Woran erkennst du Produkte aus Altpapier?',
    options: ['Am "Blauen Engel"-Symbol', 'Sie sind immer grau', 'Sie riechen nach Zeitung'],
    correctAnswer: 0,
    explanation: 'Der "Blaue Engel" ist ein wichtiges Umweltzeichen. Es garantiert, dass das Papier zu 100% aus Altpapier besteht.',
  },
  {
    id: 405,
    topicId: 4,
    question: 'Warum spart Recycling Energie?',
    options: ['Weil die Maschinen Solarstrom nutzen', 'Weil man keine neuen Rohstoffe abbauen und verarbeiten muss', 'Weil Müll brennt'],
    correctAnswer: 1,
    explanation: 'Aluminium aus alten Dosen zu gewinnen braucht 95% weniger Energie, als es neu aus Erz herzustellen!',
  }
];

interface QuizSectionProps {
  profileId?: string;
  selectedTopicId: number | null;
  onQuizComplete?: (correctAnswers: number, points: number) => void;
}

export default function QuizSection({
  profileId,
  selectedTopicId,
  onQuizComplete,
}: QuizSectionProps) {
  const [currentQuestions, setCurrentQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Update questions when topic changes
  useEffect(() => {
    if (selectedTopicId) {
      const filtered = allQuizQuestions.filter(q => q.topicId === selectedTopicId);
      setCurrentQuestions(filtered);
      resetQuizState();
    } else {
      setCurrentQuestions([]);
    }
  }, [selectedTopicId]);

  const resetQuizState = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setQuizCompleted(false);
  };

  const handleAnswerClick = (answerIndex: number) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(answerIndex);
    setShowResult(true);

    const isCorrect =
      answerIndex === currentQuestions[currentQuestionIndex].correctAnswer;

    if (isCorrect) {
      setScore(score + 1);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setQuizCompleted(true);
      handleQuizFinish();
    }
  };

  const handleQuizFinish = () => {
    // Only add points if passed (e.g., > 50% correct) or just add based on score
    // Logic: 10 points per correct answer
    const points = score * 10;
    // We only trigger callback at the very end to save points
    if (profileId && onQuizComplete) {
      // NOTE: We're calling this immediately when the last question is done, 
      // but inside the render check for 'quizCompleted' we might want to wait.
      // Actually, calling it here is fine.
      onQuizComplete(score, points);
    }
  };

  if (!selectedTopicId) {
    return (
      <section className="py-16 px-4 bg-gradient-to-b from-white to-green-50">
        <div className="container mx-auto max-w-3xl text-center">
          <div className="bg-white rounded-3xl shadow-xl p-12 border-2 border-dashed border-gray-300">
            <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-600 mb-2">
              Wähle zuerst ein Thema!
            </h2>
            <p className="text-gray-500 mb-6">
              Klicke oben im "Prozess"-Bereich auf einen der 4 Schritte (z.B. Sammeln), um das passende Quiz zu starten.
            </p>
            <div className="animate-bounce">
              <ArrowUp className="w-8 h-8 text-green-500 mx-auto" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (currentQuestions.length === 0) {
    return null; // Should not happen if Ids match
  }

  if (quizCompleted) {
    return (
      <section className="py-16 px-4 bg-gradient-to-b from-white to-green-50">
        <div className="container mx-auto max-w-3xl">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center animate-fadeIn">
            <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Trophy className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Quiz zum Thema "{currentQuestions[0].topicId === 1 ? 'Sammeln' : currentQuestions[0].topicId === 2 ? 'Sortieren' : currentQuestions[0].topicId === 3 ? 'Aufbereiten' : 'Neues Produkt'}" beendet!
            </h2>
            <p className="text-5xl font-bold text-green-600 mb-6">
              {score} / {currentQuestions.length}
            </p>
            <p className="text-xl text-gray-600 mb-8">
              {score === currentQuestions.length
                ? '🎉 Perfekt! Du bist ein echter Experte in diesem Bereich!'
                : score >= 3
                  ? '👍 Super gemacht! Das meiste wusstest du!'
                  : '💪 Gut versucht! Schau dir die Infos oben nochmal an.'}
            </p>
            
            {score > 0 && (
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-center gap-2 text-green-700 font-bold text-lg">
                  <Zap className="w-6 h-6" />
                  +{score * 10} Punkte gesammelt!
                </div>
              </div>
            )}

            <button
              onClick={resetQuizState}
              className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Nochmal üben
            </button>
          </div>
        </div>
      </section>
    );
  }

  const question = currentQuestions[currentQuestionIndex];

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-white to-green-50">
      {showConfetti && <Confetti />}
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full mb-4">
            <HelpCircle className="w-5 h-5" />
            <span className="font-semibold">Quiz: {
                 selectedTopicId === 1 ? 'Sammeln & Trennen' :
                 selectedTopicId === 2 ? 'Sortieranlagen' :
                 selectedTopicId === 3 ? 'Aufbereitung' : 'Neue Produkte'
            }</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Teste dein Wissen!
          </h2>
          <p className="text-gray-600">
            Frage {currentQuestionIndex + 1} von {currentQuestions.length}
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 min-h-[500px] flex flex-col justify-between">
          <div>
            <div className="mb-6">
              <div className="flex gap-2">
                {currentQuestions.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                      index <= currentQuestionIndex ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>

            <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-8 min-h-[64px]">
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
          </div>

          <div>
            {showResult && (
              <div
                className={`p-6 rounded-2xl mb-6 animate-fadeIn ${
                  selectedAnswer === question.correctAnswer
                    ? 'bg-green-50 border-2 border-green-200'
                    : 'bg-blue-50 border-2 border-blue-200'
                }`}
              >
                <p className="text-gray-700 leading-relaxed font-medium">
                  💡 {question.explanation}
                </p>
              </div>
            )}

            {showResult && (
              <button
                onClick={handleNextQuestion}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                {currentQuestionIndex < currentQuestions.length - 1
                  ? 'Nächste Frage'
                  : 'Ergebnis anzeigen'}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

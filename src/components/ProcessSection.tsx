import { useState } from 'react';
import { Trash2, ArrowRight, Recycle, Package, Sparkles } from 'lucide-react';

interface ProcessStep {
  id: number;
  title: string;
  icon: React.ReactNode;
  shortDesc: string;
  detailedDesc: string;
  color: string;
}

const processSteps: ProcessStep[] = [
  {
    id: 1,
    title: 'Sammeln',
    icon: <Trash2 className="w-12 h-12" />,
    shortDesc: 'Wir trennen unseren Müll',
    detailedDesc:
      'Alles beginnt bei dir zu Hause! Du trennst deinen Müll in verschiedene Tonnen: Papier, Plastik, Glas und Restmüll. Dann kommen die Müllwagen und holen die verschiedenen Abfälle ab. Je besser wir trennen, desto leichter ist das Recycling später!',
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 2,
    title: 'Sortieren',
    icon: <ArrowRight className="w-12 h-12" />,
    shortDesc: 'Maschinen sortieren genau',
    detailedDesc:
      'Im Recyclinghof passiert die Magie! Große Maschinen sortieren den Müll noch genauer. Magnete ziehen Metalle raus, Luftströme blasen leichtes Plastik in verschiedene Richtungen, und Sensoren erkennen sogar verschiedene Plastikarten. Manche Teile werden auch von Hand sortiert.',
    color: 'from-green-500 to-green-600',
  },
  {
    id: 3,
    title: 'Aufbereiten',
    icon: <Recycle className="w-12 h-12" />,
    shortDesc: 'Material wird gereinigt',
    detailedDesc:
      'Jetzt wird es richtig spannend! Das sortierte Material wird gewaschen, zerkleinert und geschmolzen. Plastik wird zu kleinen Kügelchen, Papier zu Brei, Glas wird eingeschmolzen und Metall wird erhitzt. Dabei werden Etiketten, Kleber und Schmutz entfernt. Am Ende hat man sauberes Material!',
    color: 'from-yellow-500 to-yellow-600',
  },
  {
    id: 4,
    title: 'Neues Produkt',
    icon: <Package className="w-12 h-12" />,
    shortDesc: 'Es entsteht etwas Neues',
    detailedDesc:
      'Aus dem recycelten Material werden jetzt neue Produkte hergestellt! Aus alten Plastikflaschen werden neue Flaschen, Fleecejacken oder Spielzeug. Aus Altpapier wird neues Papier und Karton. Aus altem Glas werden neue Flaschen. Der Kreislauf beginnt von vorne – das ist nachhaltig!',
    color: 'from-purple-500 to-purple-600',
  },
];

export default function ProcessSection() {
  const [selectedStep, setSelectedStep] = useState<number | null>(null);

  return (
    <section className="py-16 px-4 bg-white">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold">Der Recycling-Prozess</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Von Alt zu Neu in 4 Schritten
          </h2>
          <p className="text-gray-600 text-lg">
            Klicke auf eine Karte, um mehr zu erfahren!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {processSteps.map((step, index) => (
            <div key={step.id} className="relative">
              <button
                onClick={() =>
                  setSelectedStep(selectedStep === step.id ? null : step.id)
                }
                className={`w-full bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 text-left border-2 ${
                  selectedStep === step.id
                    ? 'border-green-500 scale-105'
                    : 'border-transparent hover:border-green-200'
                }`}
              >
                <div
                  className={`bg-gradient-to-br ${step.color} text-white w-20 h-20 rounded-2xl flex items-center justify-center mb-4 shadow-lg`}
                >
                  {step.icon}
                </div>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-2xl font-bold text-gray-800">
                    {step.title}
                  </h3>
                  <span className="text-sm font-bold text-gray-400">
                    {index + 1}/4
                  </span>
                </div>
                <p className="text-gray-600">{step.shortDesc}</p>
              </button>
              {index < processSteps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                  <ArrowRight className="w-6 h-6 text-green-400" />
                </div>
              )}
            </div>
          ))}
        </div>

        {selectedStep && (
          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8 shadow-xl animate-fadeIn">
            {processSteps
              .filter((step) => step.id === selectedStep)
              .map((step) => (
                <div key={step.id}>
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`bg-gradient-to-br ${step.color} text-white p-3 rounded-xl`}
                    >
                      {step.icon}
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-800">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    {step.detailedDesc}
                  </p>
                </div>
              ))}
          </div>
        )}
      </div>
    </section>
  );
}

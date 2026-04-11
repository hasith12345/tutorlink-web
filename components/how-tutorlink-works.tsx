import { Search, CalendarCheck, TrendingUp } from "lucide-react";

const steps = [
  {
    step: "1",
    title: "Find your tutor.",
    description:
      "Search by subject, location, or mode to discover tutors that match your learning goals.",
    icon: <Search className="w-6 h-6 text-indigo-600" />,
    color: "bg-emerald-100 text-emerald-700",
    image: "/find-tutor.jpg", // replace with your asset
  },
  {
    step: "2",
    title: "Start learning.",
    description:
      "Connect with your tutor, attend online or physical classes, and learn at your pace.",
    icon: <CalendarCheck className="w-6 h-6 text-yellow-600" />,
    color: "bg-yellow-100 text-yellow-700",
    image: "/start-learn.jpg",
  },
  {
    step: "3",
    title: "Make progress every week.",
    description:
      "Track your progress, access materials, and improve continuously with guided support.",
    icon: <TrendingUp className="w-6 h-6 text-blue-600" />,
    color: "bg-blue-100 text-blue-700",
    image: "/make-progress.jpg",
  },
];

export default function HowTutorLinkWorks() {
  return (
    <section id="how-it-works" className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-gray-800 mb-6 leading-tight drop-shadow-lg">
          How TutorLink works:
        </h2>

        {/* Steps */}
        <div className="grid gap-8 lg:grid-cols-3">
          {steps.map((item, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-2xl p-6 flex flex-col justify-between hover:shadow-lg transition"
            >
              {/* Step Number */}
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg mb-4 ${item.color}`}
              >
                {item.step}
              </div>

              {/* Text */}
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600 mb-6">
                  {item.description}
                </p>
              </div>

              {/* Image / Visual */}
              <div className="mt-auto">
                <div className="rounded-xl overflow-hidden bg-gray-100">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

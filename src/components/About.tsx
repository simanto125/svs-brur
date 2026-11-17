import { BookOpen, HandHeart, Users } from 'lucide-react';
import { aboutImages, diyaImage } from '@/data/constants';

const pillars = [
  {
    icon: BookOpen,
    title: 'Spiritual Growth',
    desc: 'Devotional worship, prayer gatherings, and the study of sacred texts to nurture inner wisdom.',
  },
  {
    icon: Users,
    title: 'Cultural Unity',
    desc: 'Celebrating our heritage through festivals, classical arts, and traditions that bind us together.',
  },
  {
    icon: HandHeart,
    title: 'Social Service',
    desc: 'Blood donation drives, clothing distribution, and welfare programs for the Rangpur community.',
  },
];

export default function About() {
  return (
    <section id="about" className="py-24">
      <div className="container-x">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* images collage */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <img
                src={aboutImages[0]}
                alt="Cultural ceremony"
                className="card h-64 w-full object-cover"
              />
              <img
                src={aboutImages[1]}
                alt="Dance performance"
                className="card mt-8 h-64 w-full object-cover"
              />
              <img
                src={aboutImages[2]}
                alt="Social work"
                className="card h-64 w-full object-cover"
              />
              <img
                src={diyaImage}
                alt="Lit diyas"
                className="card -mt-8 h-64 w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 rounded-2xl bg-navy-gradient px-6 py-3 text-center shadow-glow">
              <span className="font-display text-2xl font-bold text-saffron-300">
                Est. 2007
              </span>
            </div>
          </div>

          {/* text */}
          <div>
            <span className="eyebrow">About Our Community</span>
            <h2 className="section-title mt-3">
              Rooted in devotion, growing through service.
            </h2>
            <p className="mt-5 text-navy-700 leading-relaxed">
              Saraswata Vandana Samity (SVS) is a student-run spiritual and
              cultural organization at Begum Rokeya University, Rangpur. Since
              our founding, we have welcomed students from every department into
              a family that honors the goddess of wisdom, celebrates the rich
              tapestry of our traditions, and answers the call to serve those in
              need.
            </p>
            <p className="mt-4 text-navy-700 leading-relaxed">
              From the grand Saraswati Puja each spring to our winter clothing
              drives, every gathering is an opportunity to deepen our bonds,
              practice our values, and carry forward a legacy of compassion and
              learning on the BRUR campus.
            </p>

            <div className="mt-8 grid gap-5 sm:grid-cols-3">
              {pillars.map((p) => (
                <div
                  key={p.title}
                  className="rounded-2xl border border-saffron-100 bg-saffron-50/50 p-5 transition-transform hover:-translate-y-1"
                >
                  <div className="mb-3 inline-flex rounded-xl bg-gold-gradient p-2.5 text-navy-950 shadow-glow">
                    <p.icon size={20} />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-navy-900">
                    {p.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-navy-600">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

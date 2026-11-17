import { Quote } from 'lucide-react';
import { useSupabaseQuery } from '@/hooks/useSupabase';
import Avatar from '@/components/ui/Avatar';
import type { Advisor } from '@/types';

export default function Advisors() {
  const { data: advisors, loading } = useSupabaseQuery<Advisor>(
    'advisors',
    '*',
    [],
    { column: 'sort_order', ascending: true },
  );

  return (
    <section id="advisors" className="py-24">
      <div className="container-x">
        <div className="text-center">
          <span className="eyebrow">উপদেষ্টা পরিষদ</span>
          <h2 className="section-title mt-3">Faculty Advisory Council</h2>
          <p className="mx-auto mt-4 max-w-2xl text-navy-600">
            The respected teachers and professors of BRUR who guide SVS with
            their wisdom, blessings, and unwavering support.
          </p>
        </div>

        {loading ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card h-64 animate-pulse bg-navy-50" />
            ))}
          </div>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {advisors.map((a) => (
              <div
                key={a.id}
                className="card relative overflow-hidden p-6 text-center transition hover:-translate-y-1 hover:shadow-glow"
              >
                <Quote
                  size={48}
                  className="absolute -right-2 -top-2 text-saffron-100"
                />
                <Avatar
                  src={a.photo_url}
                  name={a.name}
                  className="mx-auto h-28 w-28 ring-4 ring-saffron-200"
                />
                <h3 className="mt-4 font-display text-lg font-bold text-navy-900">
                  {a.name}
                </h3>
                <p className="text-sm font-semibold text-saffron-700">
                  {a.academic_designation}
                </p>
                <p className="mt-1 text-xs text-navy-500">{a.department}</p>
                {a.blessing && (
                  <blockquote className="mt-4 border-t border-navy-50 pt-4">
                    <p className="font-display text-sm italic leading-relaxed text-navy-600">
                      &ldquo;{a.blessing}&rdquo;
                    </p>
                  </blockquote>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

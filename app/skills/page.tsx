import { connectDB } from '@/lib/mongodb';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Clock, Layers, CheckCircle2, AlertCircle, ArrowRight, Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SkillsGalleryPage() {
  const db = await connectDB();
  const skills = await db
    .collection('skills')
    .find({})
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0 mb-8 sm:mb-12">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Gallery</h1>
            <p className="text-base sm:text-lg text-slate-600">
              Browse automation workflows created by the community
            </p>
          </div>
          <Link
            href="/skills/record"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3.5 sm:py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl active:scale-[0.98] w-full sm:w-auto"
          >
            <Plus className="h-5 w-5" />
            <span>Create New Skill</span>
          </Link>
        </div>

        {/* Skills Grid */}
        {skills.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {skills.map((skill: any) => (
              <Link
                key={skill.skillId}
                href={`/skills/${skill.skillId}`}
                className="group bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-xl hover:border-blue-200 transition-all flex flex-col h-full"
              >
                {/* Skill Header */}
                <div className="space-y-3 mb-4 flex-shrink-0">
                  <h3 className="font-bold text-xl text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {skill.name}
                  </h3>
                  <p className="text-sm text-slate-600 line-clamp-2 min-h-[2.5rem]">
                    {skill.goal}
                  </p>
                </div>

                {/* Metrics */}
                <div className="flex items-center justify-between text-xs text-slate-500 mb-4 py-3 border-t border-slate-100 flex-shrink-0">
                  <div className="flex items-center gap-1">
                    <Layers className="h-3.5 w-3.5" />
                    <span className="font-medium text-slate-700">{skill.metrics.operations}</span>
                    <span>steps</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="font-medium text-slate-700">
                      {(skill.metrics.duration / 1000).toFixed(1)}s
                    </span>
                    <span>avg</span>
                  </div>
                  <div>
                    {skill.successfulRun ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 text-green-700 font-medium">
                        <CheckCircle2 className="h-3 w-3" />
                        Validated
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-50 text-yellow-700 font-medium">
                        <AlertCircle className="h-3 w-3" />
                        Review
                      </span>
                    )}
                  </div>
                </div>

                {/* Spacer to push bottom content down */}
                <div className="flex-1" />

                {/* View Details - Always at bottom */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto flex-shrink-0">
                  <span className="text-xs text-slate-400">
                    Created {new Date(skill.createdAt).toLocaleDateString()}
                  </span>
                  <span className="text-sm text-blue-600 font-medium group-hover:gap-2 inline-flex items-center gap-1 transition-all">
                    View Details
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-12 sm:py-20 space-y-6 px-4">
            <div className="text-6xl sm:text-7xl">🤖</div>
            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">No skills yet</h2>
              <p className="text-base sm:text-lg text-slate-600 max-w-md mx-auto">
                Be the first to create an automation workflow!
              </p>
            </div>
            <Link
              href="/skills/record"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl active:scale-[0.98] w-full sm:w-auto max-w-xs mx-auto"
            >
              <Plus className="h-5 w-5" />
              <span>Create Your First Skill</span>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

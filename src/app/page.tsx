import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900 mb-6">
          Your AI committee doesn't <br />
          <span className="text-blue-600">always agree</span>. <br />
          That's the point.
        </h1>
        
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          QuorumAI is a deal-evaluation platform for solo angel investors and small funds. 
          Four distinct AI committee personas independently analyze real deals, genuinely 
          cross-examine each other, and produce a structured memo that explicitly preserves 
          genuine disagreement — never averaging it away into false consensus.
        </p>

        <div className="flex gap-4 justify-center">
          <Link 
            href="/sign-up"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Start Evaluating Deals
          </Link>
          <Link 
            href="#how-it-works"
            className="px-8 py-3 bg-white text-gray-900 rounded-lg font-semibold border-2 border-gray-300 hover:border-gray-400 transition"
          >
            How It Works
          </Link>
        </div>
      </div>

      {/* The Four Personas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Four Genuinely Different Analytical Lenses</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg p-6 border-l-4 border-red-500 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Market Skeptic</h3>
            <p className="text-gray-600">
              Challenges market sizing, competitive landscape, and demand assumptions
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 border-l-4 border-blue-500 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Financial Diligence</h3>
            <p className="text-gray-600">
              Scrutinizes unit economics, projections, and internal consistency
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 border-l-4 border-violet-500 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Founder & Team</h3>
            <p className="text-gray-600">
              Assesses founder-market fit, track record, and team composition
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 border-l-4 border-amber-500 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Risk & Legal</h3>
            <p className="text-gray-600">
              Identifies structural, regulatory, IP, and deal-term risks
            </p>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div id="how-it-works" className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="space-y-8">
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Upload Real Deal Materials</h3>
                <p className="text-gray-600">
                  Upload a real pitch deck and any supporting financial documents. 
                  Automatic text extraction with honest "scanned image" fallback.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Four Independent Analyses</h3>
                <p className="text-gray-600">
                  Each persona independently analyzes the deal from their distinct analytical lens, 
                  producing specific, falsifiable claims grounded in the actual uploaded materials.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Real Cross-Examination</h3>
                <p className="text-gray-600">
                  Personas genuinely challenge each other's specific claims across multiple rounds. 
                  Watch the debate unfold live as they concede, partially concede, or hold their positions.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                4
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Structured Memo with Dissent Preserved</h3>
                <p className="text-gray-600">
                  The final memo shows consensus, resolved concessions, and — critically — any 
                  genuine unresolved disagreement with all distinct positions shown verbatim. 
                  <span className="font-semibold"> Dissent is never averaged away.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to get a second (and third, and fourth) opinion?</h2>
        <Link 
          href="/sign-up"
          className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Start Your First Deliberation
        </Link>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>© 2026 QuorumAI. All rights reserved.</p>
          <p className="mt-2 text-sm">
            Built with Next.js, Anthropic Claude, and a genuine commitment to preserving dissent.
          </p>
        </div>
      </footer>
    </div>
  );
}

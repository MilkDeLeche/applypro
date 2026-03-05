import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, PenTool, FileSpreadsheet, Zap, ArrowRight, Play, Pause } from 'lucide-react';

const products = [
  {
    id: 'mail',
    name: 'Mail',
    icon: Mail,
    headline: 'The most productive email app ever made',
    description: 'Fly through your inbox twice as fast as before, never drop the ball again, and save 4 hours every single week.',
    features: [
      'Respond faster to what matters most',
      'Follow up on time, every time',
      'Write with AI that sounds like you',
      'Save 4 hours every single week',
    ],
    video: '/videos/mail-demo.mp4',
    color: 'bg-purple-100',
  },
  {
    id: 'grammarly',
    name: 'Grammarly',
    icon: PenTool,
    headline: "Everyone's favorite AI writing partner",
    description: "Turn your thoughts into writing that's clear, credible, and impossible to ignore.",
    features: [
      'Works everywhere you write',
      'Find the right words instantly',
      'Write with AI that adapts to your tone and voice',
      'Let your brilliance shine',
    ],
    video: '/videos/grammarly-demo.mp4',
    color: 'bg-green-100',
  },
  {
    id: 'coda',
    name: 'Coda',
    icon: FileSpreadsheet,
    headline: 'The all-in-one AI workspace for teams',
    description: 'Build everything from wikis, through project plans, to goal trackers — keeping everyone perfectly in sync.',
    features: [
      'Connect Slack, Jira, Salesforce, and 800+ tools',
      'Build your team wiki, project plans, and company goal trackers',
      "Create a single source of truth for all your team's knowledge",
      'Save time on manual tasks with Coda AI',
    ],
    video: '/videos/coda-demo.mp4',
    color: 'bg-yellow-100',
  },
  {
    id: 'go',
    name: 'Go',
    icon: Zap,
    headline: 'AI that actually works in every app you use',
    description: 'Go is the proactive AI assistant that knows what you know and offers help without you having to ask.',
    features: [
      'Connect Gmail, Drive, Jira, and all of your favorite apps',
      'Say the right thing with the right info, everywhere you write',
      'Schedule meetings without leaving the conversation',
      'Work with any app, from any app',
    ],
    video: '/videos/go-demo.mp4',
    color: 'bg-orange-100',
  },
];

function VideoPlayer({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="relative">
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className="w-full h-auto rounded-lg"
      >
        <source src={src} type="video/mp4" />
      </video>
      <button
        onClick={togglePlay}
        className="absolute bottom-4 left-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
      >
        {isPlaying ? (
          <Pause className="w-5 h-5 text-stone-900" />
        ) : (
          <Play className="w-5 h-5 text-stone-900 ml-0.5" />
        )}
      </button>
    </div>
  );
}

export function ProductSuite() {
  const [activeTab, setActiveTab] = useState('mail');
  const activeProduct = products.find(p => p.id === activeTab) || products[0];

  return (
    <section className="bg-stone-100 px-9 py-16">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <h2 className="text-4xl md:text-5xl font-medium text-stone-900">Your Superhuman suite</h2>
          <a
            href="#pricing"
            className="inline-flex items-center text-purple-800 font-medium hover:text-purple-900 transition-colors"
          >
            Get the suite
          </a>
        </div>

        {/* Tabs */}
        <div className="border-2 border-stone-300 bg-stone-100 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {products.map((product) => {
              const Icon = product.icon;
              return (
                <button
                  key={product.id}
                  onClick={() => setActiveTab(product.id)}
                  className={`flex items-center justify-center gap-2 py-4 px-4 border-r-2 border-b-2 md:border-b-0 border-stone-300 last:border-r-0 transition-colors ${
                    activeTab === product.id
                      ? 'bg-stone-200'
                      : 'hover:bg-stone-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{product.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="diagonal-stripes border-2 border-stone-300 p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-stone-100 border-t-2 border-b-2 border-stone-300"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Left - Content */}
                <div className="p-8 lg:p-12">
                  {/* Product Header */}
                  <div className="dash-pattern flex items-center gap-3 px-4 py-3 mb-8">
                    <activeProduct.icon className="w-6 h-6" />
                    <span className="text-xl font-medium">{activeProduct.name}</span>
                  </div>

                  {/* Headline */}
                  <h3 className="text-3xl md:text-4xl lg:text-5xl font-medium mb-4">
                    {activeProduct.headline}
                  </h3>

                  {/* Description */}
                  <p className="text-stone-600 text-lg mb-6">
                    {activeProduct.description}
                  </p>

                  {/* Learn More Link */}
                  <a
                    href={`#${activeProduct.id}`}
                    className="inline-flex items-center gap-2 text-purple-800 font-medium hover:text-purple-900 transition-colors mb-8 group"
                  >
                    <span>Learn more about {activeProduct.name}</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </a>

                  {/* Features List */}
                  <ul className="space-y-3">
                    {activeProduct.features.map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-3 text-lg"
                      >
                        <span className="w-2 h-2 rounded-full bg-purple-800 mt-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Right - Video */}
                <div className="p-4 lg:p-8 flex items-center">
                  <VideoPlayer src={activeProduct.video} />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

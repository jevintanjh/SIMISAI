import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@iconify/react";

interface HowItWorksProps {
  onBack: () => void;
}

export default function HowItWorks({ onBack }: HowItWorksProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E1B4B] to-[#312E81]">
      {/* Back Button */}
      <div className="absolute top-6 left-6 z-50">
        <Card 
          className="bg-card/50 border border-border backdrop-blur-sm cursor-pointer hover:bg-white/10 transition-colors"
          onClick={onBack}
        >
          <CardContent className="px-6 py-2">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Icon icon="mingcute:arrow-to-left-fill" className="w-4 h-4 text-white/70" />
              </div>
              <span className="text-white font-medium">Back to App</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 py-20 text-center overflow-hidden">
        <div className="relative z-10 max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 rounded-full px-6 py-3 mb-8 backdrop-blur-sm">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span className="text-primary text-sm font-medium">AI-Powered Medical Guidance</span>
          </div>
          
          {/* Main Heading */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-8 leading-tight">
            How <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">SIMIS</span> Works
          </h1>
          
          {/* Subtitle */}
          <p className="text-white/80 text-lg md:text-xl max-w-3xl mx-auto mb-16 leading-relaxed">
            AI-powered medical device guidance that provides real-time, personalized instructions for safe and effective device usage.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Button 
              onClick={() => window.location.href = '/'}
              className="inline-flex items-center space-x-2 bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200"
            >
              <span>Try now</span>
              <Icon icon="mingcute:play-fill" className="w-5 h-5" />
            </Button>
            
            <button 
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center px-6 py-3 bg-transparent text-white border border-white hover:bg-white/10 hover:border-white/50 rounded-xl transition-all duration-200"
            >
              <span>Learn more</span>
              <Icon icon="mingcute:external-link-fill" className="w-4 h-4 ml-2" />
            </button>
          </div>
          
        </div>
      </section>

      {/* How it works Steps */}
      <section id="how-it-works" className="container mx-auto px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              How it works
            </h2>
            <p className="text-white/70 text-lg max-w-3xl mx-auto">
              Experience the power of AI-driven medical device guidance in six simple steps
            </p>
          </div>

          <div className="relative">
            <div className="space-y-16">
              {/* Step 1 */}
              <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
                <div className="flex-shrink-0 order-2 lg:order-1">
                  <div className="w-64 h-64 bg-gradient-to-br from-primary/20 to-primary/40 rounded-3xl flex items-center justify-center border border-primary/30 backdrop-blur-sm overflow-hidden shadow-lg">
                    <img src="/Demo 1.jpg" alt="Device Detection" className="w-full h-full object-cover rounded-3xl" />
                  </div>
                </div>
                <div className="flex-1 order-1 lg:order-2">
                  <Card className="bg-card/30 border border-border rounded-3xl p-8 backdrop-blur-sm">
                    <CardContent className="p-0">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                        <h3 className="text-xl font-bold text-white">Device Detection</h3>
                      </div>
                      <p className="text-white/80 text-lg leading-relaxed">
                        Point your camera at your medical device. Our advanced computer vision technology instantly identifies the device type, brand, and model in real-time, ensuring accurate guidance.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col lg:flex-row-reverse items-center gap-8 lg:gap-16">
                <div className="flex-shrink-0 order-2 lg:order-1">
                  <div className="w-40 h-40 bg-gradient-to-br from-green-500/20 to-green-500/40 rounded-3xl flex items-center justify-center border border-green-500/30 backdrop-blur-sm overflow-hidden shadow-lg">
                    <img src="/attached_assets/Demo 2.jpg" alt="AI Analysis" className="w-full h-full object-cover rounded-3xl" />
                  </div>
                </div>
                <div className="flex-1 order-1 lg:order-2">
                  <Card className="bg-card/30 border border-border rounded-3xl p-8 backdrop-blur-sm">
                    <CardContent className="p-0">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                        <h3 className="text-xl font-bold text-white">AI Analysis</h3>
                      </div>
                      <p className="text-white/80 text-lg leading-relaxed">
                        Our AI analyzes the device state, user positioning, and context to provide personalized guidance tailored to your specific device and situation.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
                <div className="flex-shrink-0 order-2 lg:order-1">
                  <div className="w-40 h-40 bg-gradient-to-br from-blue-500/20 to-blue-500/40 rounded-3xl flex items-center justify-center border border-blue-500/30 backdrop-blur-sm overflow-hidden shadow-lg">
                    <img src="/attached_assets/Demo 3.jpg" alt="Step-by-Step Guidance" className="w-full h-full object-cover rounded-3xl" />
                  </div>
                </div>
                <div className="flex-1 order-1 lg:order-2">
                  <Card className="bg-card/30 border border-border rounded-3xl p-8 backdrop-blur-sm">
                    <CardContent className="p-0">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                        <h3 className="text-xl font-bold text-white">Step-by-Step Guidance</h3>
                      </div>
                      <p className="text-white/80 text-lg leading-relaxed">
                        Receive clear, step-by-step instructions in your preferred language with voice assistance and visual cues to ensure proper device usage.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col lg:flex-row-reverse items-center gap-8 lg:gap-16">
                <div className="flex-shrink-0 order-2 lg:order-1">
                  <div className="w-40 h-40 bg-gradient-to-br from-purple-500/20 to-purple-500/40 rounded-3xl flex items-center justify-center border border-purple-500/30 backdrop-blur-sm overflow-hidden shadow-lg">
                    <img src="/attached_assets/Demo 4.jpg" alt="Real-time Monitoring" className="w-full h-full object-cover rounded-3xl" />
                  </div>
                </div>
                <div className="flex-1 order-1 lg:order-2">
                  <Card className="bg-card/30 border border-border rounded-3xl p-8 backdrop-blur-sm">
                    <CardContent className="p-0">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">4</div>
                        <h3 className="text-xl font-bold text-white">Real-time Monitoring</h3>
                      </div>
                      <p className="text-white/80 text-lg leading-relaxed">
                        Continuous monitoring detects errors, incorrect positioning, or device issues, providing immediate feedback and correction suggestions.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Step 5 */}
              <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
                <div className="flex-shrink-0 order-2 lg:order-1">
                  <div className="w-40 h-40 bg-gradient-to-br from-orange-500/20 to-orange-500/40 rounded-3xl flex items-center justify-center border border-orange-500/30 backdrop-blur-sm overflow-hidden shadow-lg">
                    <img src="/attached_assets/Demo 5.jpg" alt="Interactive Support" className="w-full h-full object-cover rounded-3xl" />
                  </div>
                </div>
                <div className="flex-1 order-1 lg:order-2">
                  <Card className="bg-card/30 border border-border rounded-3xl p-8 backdrop-blur-sm">
                    <CardContent className="p-0">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">5</div>
                        <h3 className="text-xl font-bold text-white">Interactive Support</h3>
                      </div>
                      <p className="text-white/80 text-lg leading-relaxed">
                        Ask questions anytime through our AI chat system. Get instant answers and troubleshooting help for any device-related concerns.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Step 6 */}
              <div className="flex flex-col lg:flex-row-reverse items-center gap-8 lg:gap-16">
                <div className="flex-shrink-0 order-2 lg:order-1">
                  <div className="w-40 h-40 bg-gradient-to-br from-red-500/20 to-red-500/40 rounded-3xl flex items-center justify-center border border-red-500/30 backdrop-blur-sm overflow-hidden shadow-lg">
                    <img src="/attached_assets/Demo 6.jpg" alt="Learning Summary" className="w-full h-full object-cover rounded-3xl" />
                  </div>
                </div>
                <div className="flex-1 order-1 lg:order-2">
                  <Card className="bg-card/30 border border-border rounded-3xl p-8 backdrop-blur-sm">
                    <CardContent className="p-0">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">6</div>
                        <h3 className="text-xl font-bold text-white">Learning Summary</h3>
                      </div>
                      <p className="text-white/80 text-lg leading-relaxed">
                        Get a comprehensive summary of your session with key learnings, areas for improvement, and personalized recommendations for future use.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Powerful <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">Features</span>
            </h2>
            <p className="text-white/70 text-lg max-w-3xl mx-auto">
              Everything you need for safe and effective medical device usage
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="bg-card/20 border border-border rounded-2xl p-8 backdrop-blur-sm hover:bg-card/30 transition-all duration-300 group">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/40 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform overflow-hidden">
                  <img src="/attached_assets/Demo 7.jpg" alt="Multi-Device Support" className="w-full h-full object-cover rounded-2xl" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Multi-Device Support</h3>
                <p className="text-white/70 leading-relaxed">
                  Supports thermometers, blood pressure monitors, glucose meters, and more with device-specific guidance tailored to each device.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="bg-card/20 border border-border rounded-2xl p-8 backdrop-blur-sm hover:bg-card/30 transition-all duration-300 group">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-green-500/40 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Icon icon="mingcute:translate-line" className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Multilingual Support</h3>
                <p className="text-white/70 leading-relaxed">
                  Available in 10+ languages including English, Indonesian, Thai, Vietnamese, and more for global accessibility.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="bg-card/20 border border-border rounded-2xl p-8 backdrop-blur-sm hover:bg-card/30 transition-all duration-300 group">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-blue-500/40 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Icon icon="mingcute:mic-line" className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Voice Assistance</h3>
                <p className="text-white/70 leading-relaxed">
                  Choose between male, female, or text-only guidance based on your preference for the most comfortable experience.
                </p>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="bg-card/20 border border-border rounded-2xl p-8 backdrop-blur-sm hover:bg-card/30 transition-all duration-300 group">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-purple-500/40 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Icon icon="mingcute:camera-line" className="w-8 h-8 text-purple-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Real-time Detection</h3>
                <p className="text-white/70 leading-relaxed">
                  Advanced computer vision instantly recognizes your device and provides contextual guidance in real-time.
                </p>
              </CardContent>
            </Card>

            {/* Feature 5 */}
            <Card className="bg-card/20 border border-border rounded-2xl p-8 backdrop-blur-sm hover:bg-card/30 transition-all duration-300 group">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500/20 to-orange-500/40 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Icon icon="mingcute:warning-line" className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Error Detection</h3>
                <p className="text-white/70 leading-relaxed">
                  Automatically detects common mistakes and provides immediate correction guidance to ensure proper usage.
                </p>
              </CardContent>
            </Card>

            {/* Feature 6 */}
            <Card className="bg-card/20 border border-border rounded-2xl p-8 backdrop-blur-sm hover:bg-card/30 transition-all duration-300 group">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500/20 to-red-500/40 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Icon icon="mingcute:lightbulb-line" className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Personalized Learning</h3>
                <p className="text-white/70 leading-relaxed">
                  Adapts to your learning style with direct, gentle, or detailed guidance options for optimal user experience.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="bg-gradient-to-r from-primary/10 via-blue-500/10 to-purple-500/10 border border-primary/20 rounded-3xl p-12 backdrop-blur-sm">
            <CardContent className="p-0">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Ready to Get <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">Started?</span>
              </h2>
              <p className="text-white/80 text-lg mb-10 max-w-3xl mx-auto leading-relaxed">
                Experience the future of medical device guidance with SIMIS. Get personalized, real-time assistance for all your medical devices with our advanced AI technology.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                <Button 
                  onClick={() => window.location.href = '/'}
                  className="inline-flex items-center space-x-2 bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200"
                >
                  <span>Try it now</span>
                  <Icon icon="mingcute:arrow-right-line" className="w-5 h-5" />
                </Button>
                
                <div className="text-white/60 text-sm">
                  <span>100% Free to Use</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-12 border-t border-white/10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <h3 className="text-2xl font-bold text-white">SIMIS</h3>
            </div>
            <p className="text-white/60 text-lg mb-6 max-w-2xl mx-auto">
              Empowering safe and effective medical device usage through advanced AI technology. Making healthcare more accessible, one device at a time.
            </p>
            <div className="text-white/50 text-sm">
              <p>&copy; 2024 SIMIS. All rights reserved.</p>
              <p className="mt-2">Built with ❤️ for better healthcare outcomes</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

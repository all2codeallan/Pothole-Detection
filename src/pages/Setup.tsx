
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ExternalLink, Copy, Key, AlertCircle } from 'lucide-react';

const Setup = () => {
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'none' | 'valid' | 'invalid'>('none');

  const validateApiKey = async () => {
    if (!apiKey.trim()) return;
    
    setIsValidating(true);
    try {
      // Mock validation - in real implementation, make a test API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setValidationStatus('valid');
      localStorage.setItem('googleMapsApiKey', apiKey);
    } catch (error) {
      setValidationStatus('invalid');
    } finally {
      setIsValidating(false);
    }
  };

  const steps = [
    {
      title: "Create Google Cloud Project",
      description: "Go to Google Cloud Console and create a new project",
      link: "https://console.cloud.google.com/",
      completed: false
    },
    {
      title: "Enable Required APIs",
      description: "Enable Maps JavaScript API, Places API, Directions API, Street View API, and Geocoding API",
      apis: [
        "Maps JavaScript API",
        "Places API", 
        "Directions API",
        "Street View Static API",
        "Geocoding API"
      ],
      completed: false
    },
    {
      title: "Create API Key",
      description: "Generate an API key in the Credentials section",
      link: "https://console.cloud.google.com/apis/credentials",
      completed: false
    },
    {
      title: "Configure API Key",
      description: "Add your domain restrictions for security",
      completed: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Google Maps Setup</h1>
          <p className="text-cyan-400 text-lg">Configure your Google Maps API key for full functionality</p>
        </div>

        {/* Quick Start */}
        <Card className="bg-black/20 border-cyan-500/30 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Key className="w-5 h-5 text-cyan-400" />
              <span>Quick API Key Setup</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-4">
              <input
                type="password"
                placeholder="Enter your Google Maps API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="flex-1 bg-black/30 border border-cyan-500/30 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              />
              <button
                onClick={validateApiKey}
                disabled={!apiKey.trim() || isValidating}
                className="bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-black px-6 py-2 rounded-lg font-medium transition-all"
              >
                {isValidating ? 'Validating...' : 'Validate'}
              </button>
            </div>
            
            {validationStatus === 'valid' && (
              <div className="flex items-center space-x-2 text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span>API key validated successfully!</span>
              </div>
            )}
            
            {validationStatus === 'invalid' && (
              <div className="flex items-center space-x-2 text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span>Invalid API key. Please check and try again.</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Setup Steps */}
        <div className="grid gap-6">
          {steps.map((step, index) => (
            <Card key={index} className="bg-black/20 border-purple-500/30 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full flex items-center justify-center text-black font-bold">
                    {index + 1}
                  </div>
                  <span>{step.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300">{step.description}</p>
                
                {step.apis && (
                  <div className="grid grid-cols-2 gap-2">
                    {step.apis.map((api) => (
                      <div key={api} className="bg-black/30 p-2 rounded border border-cyan-500/20">
                        <span className="text-cyan-400 text-sm">{api}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {step.link && (
                  <a
                    href={step.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open in Google Cloud Console</span>
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Environment Setup */}
        <Card className="bg-black/20 border-green-500/30 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-white">Environment Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-300">For development, you can also set your API key as an environment variable:</p>
            <div className="bg-black/50 p-4 rounded-lg">
              <code className="text-green-400">VITE_GOOGLE_MAPS_API_KEY=your_api_key_here</code>
              <button
                onClick={() => navigator.clipboard.writeText('VITE_GOOGLE_MAPS_API_KEY=your_api_key_here')}
                className="ml-2 text-cyan-400 hover:text-cyan-300"
              >
                <Copy className="w-4 h-4 inline" />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Continue Button */}
        <div className="text-center">
          <button
            onClick={() => window.location.href = '/app/map'}
            disabled={validationStatus !== 'valid'}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-medium transition-all transform hover:scale-105"
          >
            Continue to Maps
          </button>
        </div>
      </div>
    </div>
  );
};

export default Setup;

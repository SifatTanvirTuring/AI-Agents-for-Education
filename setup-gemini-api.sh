#!/bin/bash

# Setup script for Gemini API integration
echo "🔧 Setting up Gemini API integration for Learning Buddy..."

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp config.env.example .env
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

# Check if Gemini API key is configured
if grep -q "your-gemini-api-key-here" .env; then
    echo ""
    echo "⚠️  WARNING: Gemini API key not configured!"
    echo ""
    echo "To use the real Gemini API, you need to:"
    echo "1. Get a Gemini API key from: https://makersuite.google.com/app/apikey"
    echo "2. Edit the .env file and replace 'your-gemini-api-key-here' with your actual API key"
    echo "3. Restart the application"
    echo ""
    echo "Example:"
    echo "GEMINI_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    echo ""
else
    echo "✅ Gemini API key appears to be configured"
fi

# Check if @google/generative-ai is installed
if npm list @google/generative-ai &> /dev/null; then
    echo "✅ @google/generative-ai package is installed"
else
    echo "📦 Installing @google/generative-ai package..."
    npm install @google/generative-ai
    if [ $? -eq 0 ]; then
        echo "✅ @google/generative-ai installed successfully"
    else
        echo "❌ Failed to install @google/generative-ai"
        exit 1
    fi
fi

echo ""
echo "🎉 Gemini API setup complete!"
echo ""
echo "Next steps:"
echo "1. Get your Gemini API key from: https://makersuite.google.com/app/apikey"
echo "2. Update the GEMINI_API_KEY in your .env file"
echo "3. Run 'npm run dev' to start the application"
echo ""
echo "The application will now use the real Gemini API instead of mock responses!"




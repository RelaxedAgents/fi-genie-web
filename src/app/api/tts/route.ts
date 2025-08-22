import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { text, lang = 'en-GB', voice = 'en-GB-Standard-A' } = await request.json()

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    // For demo purposes, we'll return a mock response
    // In production, this would integrate with Google Cloud TTS or another TTS service
    const mockResponse = {
      audio: 'base64_encoded_audio_data_here',
      duration: text.length * 0.1, // Rough estimate
      words: text.split(' ').map((word: string, index: number) => ({
        word,
        start: index * 0.5,
        end: (index + 1) * 0.5
      }))
    }

    return NextResponse.json(mockResponse)
  } catch (error) {
    console.error('TTS API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'TTS API endpoint. Use POST method with { text, lang?, voice? }' 
  })
}

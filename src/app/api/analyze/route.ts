import OpenAI from 'openai'
import { NextResponse } from 'next/server'
import { analysisSchema } from '../../../lib/analysisSchema'
import { buildLegalSimplificationPrompt } from '../../../lib/prompt'
import { validateAnalysisResult } from '../../../lib/validateAnalysisResult'
import type { AnalysisResult } from '../../../lib/types'

const MAX_TEXT_LENGTH = 4000
const DEFAULT_MODEL = 'gpt-5.5'

type AnalyzeRequestBody = {
  text?: unknown
}

type AnalyzeSuccessResponse = {
  ok: true
  result: AnalysisResult
}

type AnalyzeErrorResponse = {
  ok: false
  error: string
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AnalyzeRequestBody
    const rawText = body.text
    const validationError = validateText(rawText)

    if (validationError) {
      return jsonError(validationError, 400)
    }

    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      return jsonError('OpenAI API key is not configured.', 500)
    }

    const text = typeof rawText === 'string' ? rawText.trim() : ''
    const client = new OpenAI({ apiKey })
    const prompt = buildLegalSimplificationPrompt(text)
    const model = process.env.OPENAI_MODEL || DEFAULT_MODEL

    const response = await client.responses.create({
      model,
      input: prompt,
      text: {
        format: {
          type: 'json_schema',
          name: 'analysis_result',
          schema: analysisSchema,
          strict: true,
        },
      },
    })

    if (!response.output_text) {
      return jsonError('OpenAI returned an empty analysis result.', 502)
    }

    const parsedResult: unknown = JSON.parse(response.output_text)
    const resultValidation = validateAnalysisResult(parsedResult)

    if (!resultValidation.valid) {
      return jsonError(`Invalid analysis result: ${resultValidation.error}`, 502)
    }

    const result = parsedResult as AnalysisResult

    return NextResponse.json<AnalyzeSuccessResponse>({ ok: true, result })
  } catch (error) {
    return jsonError(getErrorMessage(error), 500)
  }
}

function validateText(value: unknown) {
  if (typeof value !== 'string') {
    return 'Request body must include a text string.'
  }

  const trimmed = value.trim()

  if (!trimmed) {
    return 'Please paste a clause before generating reading support.'
  }

  if (trimmed.length > MAX_TEXT_LENGTH) {
    return `Please use a shorter clause for this prototype. The current limit is ${MAX_TEXT_LENGTH} characters.`
  }

  return null
}

function jsonError(error: string, status: number) {
  return NextResponse.json<AnalyzeErrorResponse>({ ok: false, error }, { status })
}

function getErrorMessage(error: unknown) {
  if (error instanceof SyntaxError) {
    return 'Invalid JSON request or model response.'
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Analysis failed.'
}

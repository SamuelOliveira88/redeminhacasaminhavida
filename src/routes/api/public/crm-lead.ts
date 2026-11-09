import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

const leadSchema = z.object({
  nome: z.string().min(1).max(200),
  telefone: z.string().min(1).max(30),
  email: z.string().email().max(200).optional().nullable(),
  mensagem: z.string().max(1000).optional().nullable(),
})

const CRM_URL = 'https://www.alexandrialeads.app/api/public/webhook'

export const Route = createFileRoute('/api/public/crm-lead')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let payload: z.infer<typeof leadSchema>
        try {
          payload = leadSchema.parse(await request.json())
        } catch {
          return Response.json({ ok: false, error: 'invalid' }, { status: 400 })
        }

        const token = process.env['CRM_WEBHOOK_TOKEN']
        if (!token) {
          return Response.json({ ok: false, error: 'not_configured' }, { status: 500 })
        }

        const body: Record<string, string> = {
          nome: payload.nome,
          telefone: payload.telefone,
        }
        if (payload.email) body.email = payload.email
        if (payload.mensagem) body.mensagem = payload.mensagem

        try {
          const res = await fetch(CRM_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-webhook-token': token,
            },
            body: JSON.stringify(body),
          })
          return Response.json({ ok: res.ok }, { status: 200 })
        } catch {
          // CRM fora do ar: o formulário do site continua funcionando
          return Response.json({ ok: false, error: 'crm_unreachable' }, { status: 200 })
        }
      },
    },
  },
})

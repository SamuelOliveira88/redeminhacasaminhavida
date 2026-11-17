import React from 'react'
import { Body, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  nome?: string
  telefone?: string
  email?: string
  mensagem?: string
}

const Email = ({ nome, telefone, email, mensagem }: Props) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Novo cadastro: {nome || 'cliente'}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Novo cadastro no site</Heading>
        <Text style={text}><b>Nome:</b> {nome || '-'}</Text>
        <Text style={text}><b>WhatsApp:</b> {telefone || '-'}</Text>
        {email ? <Text style={text}><b>E-mail:</b> {email}</Text> : null}
        <Text style={text}><b>Detalhes:</b> {mensagem || '-'}</Text>
        <Text style={muted}>Veja todos em redeminhacasaminhavida.com/cadastros</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (d: Record<string, any>) => `Novo cadastro: ${d.nome || 'cliente'}`,
  displayName: 'Aviso de novo cadastro',
  to: 'samuelrodrigodeoliveira@gmail.com',
  previewData: { nome: 'Maria Silva', telefone: '11999999999', mensagem: 'Página: Paula | Empreendimento: Abiatar Conecta' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '20px 25px' }
const h1 = { color: '#1f6b3a', fontSize: '22px' }
const text = { fontSize: '15px', color: '#222', margin: '6px 0' }
const muted = { fontSize: '13px', color: '#777', marginTop: '20px' }

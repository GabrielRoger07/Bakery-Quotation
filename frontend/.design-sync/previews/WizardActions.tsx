import { WizardActions } from '@bakery/design-system'
import { Calendar } from 'lucide-react'

export const Blocked = () => (
  <div style={{ position: 'relative', maxWidth: 640 }}>
    <WizardActions
      onBack={() => {}}
      onPrimary={() => {}}
      primaryLabel="Próximo"
      primaryIcon={Calendar}
      blocked
      hint="Preencha os campos obrigatórios para avançar."
    />
  </div>
)

export const Ready = () => (
  <div style={{ position: 'relative', maxWidth: 640 }}>
    <WizardActions onBack={() => {}} onPrimary={() => {}} primaryLabel="Criar cotação" primaryIcon={Calendar} />
  </div>
)

import { Input, Select, Textarea, Label } from '@dashin-dev/dashin'
import { StepAction } from '../types'

export interface ActionEditorProps {
  action: StepAction
  onChange: (action: StepAction) => void
}

export function ActionEditor({ action, onChange }: ActionEditorProps) {
  const kind = Object.keys(action)[0] as keyof StepAction
  const body: any = (action as any)[kind]

  switch (kind) {
    case 'SetVariable':
      return (
        <div className="space-y-2 text-xs">
          <div>
            <Label className="block text-icon-muted mb-1 text-xs">Variable Key</Label>
            <Input
              type="text"
              value={body.key || ''}
              onChange={(e) => onChange({ SetVariable: { ...body, key: e.target.value } })}
              className="w-full text-xs"
            />
          </div>
          <div>
            <Label className="block text-icon-muted mb-1 text-xs">Value (JSON / Primitive)</Label>
            <Input
              type="text"
              value={typeof body.value === 'object' ? JSON.stringify(body.value) : String(body.value ?? '')}
              onChange={(e) => {
                let val: any = e.target.value
                try { val = JSON.parse(e.target.value) } catch {}
                onChange({ SetVariable: { ...body, value: val } })
              }}
              className="w-full text-xs font-mono"
            />
          </div>
        </div>
      )

    case 'Delay':
      return (
        <div className="text-xs">
          <Label className="block text-icon-muted mb-1 text-xs">Delay Duration (Seconds)</Label>
          <Input
            type="number"
            value={body.seconds || 0}
            onChange={(e) => onChange({ Delay: { seconds: Number(e.target.value) || 0 } })}
            className="w-full text-xs"
          />
        </div>
      )

    case 'Http':
      return (
        <div className="space-y-2 text-xs">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label className="block text-icon-muted mb-1 text-xs">Method</Label>
              <Select
                value={body.method || 'GET'}
                onChange={(e) => onChange({ Http: { ...body, method: e.target.value } })}
                className="w-full text-xs"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
              </Select>
            </div>
            <div className="col-span-2">
              <Label className="block text-icon-muted mb-1 text-xs">Endpoint URL</Label>
              <Input
                type="text"
                value={body.url || ''}
                onChange={(e) => onChange({ Http: { ...body, url: e.target.value } })}
                className="w-full text-xs"
                placeholder="https://api.example.com"
              />
            </div>
          </div>
          <div>
            <Label className="block text-icon-muted mb-1 text-xs">Request Body (JSON, Optional)</Label>
            <Textarea
              rows={2}
              value={body.body ? JSON.stringify(body.body, null, 2) : ''}
              onChange={(e) => {
                let parsed: any = undefined
                try { if (e.target.value) parsed = JSON.parse(e.target.value) } catch {}
                onChange({ Http: { ...body, body: parsed } })
              }}
              className="w-full text-xs font-mono"
              placeholder="{}"
            />
          </div>
        </div>
      )

    case 'Mutation':
      return (
        <div className="text-xs">
          <Label className="block text-icon-muted mb-1 text-xs">GraphQL Mutation</Label>
          <Textarea
            rows={3}
            value={body.query || ''}
            onChange={(e) => onChange({ Mutation: { ...body, query: e.target.value } })}
            className="w-full text-xs font-mono"
          />
        </div>
      )

    default:
      return <div className="text-xs text-icon-muted">Standard action configuration</div>
  }
}

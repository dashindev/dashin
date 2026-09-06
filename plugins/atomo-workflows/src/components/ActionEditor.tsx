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
            <label className="block text-icon-muted mb-1">Variable Key</label>
            <input
              type="text"
              value={body.key || ''}
              onChange={(e) => onChange({ SetVariable: { ...body, key: e.target.value } })}
              className="w-full px-2 py-1.5 border border-bn-border rounded-bn bg-content-box text-foreground text-xs"
            />
          </div>
          <div>
            <label className="block text-icon-muted mb-1">Value (JSON / Primitive)</label>
            <input
              type="text"
              value={typeof body.value === 'object' ? JSON.stringify(body.value) : String(body.value ?? '')}
              onChange={(e) => {
                let val: any = e.target.value
                try { val = JSON.parse(e.target.value) } catch {}
                onChange({ SetVariable: { ...body, value: val } })
              }}
              className="w-full px-2 py-1.5 border border-bn-border rounded-bn bg-content-box text-foreground text-xs font-mono"
            />
          </div>
        </div>
      )

    case 'Delay':
      return (
        <div className="text-xs">
          <label className="block text-icon-muted mb-1">Delay Duration (Seconds)</label>
          <input
            type="number"
            value={body.seconds || 0}
            onChange={(e) => onChange({ Delay: { seconds: Number(e.target.value) || 0 } })}
            className="w-full px-2 py-1.5 border border-bn-border rounded-bn bg-content-box text-foreground text-xs"
          />
        </div>
      )

    case 'Http':
      return (
        <div className="space-y-2 text-xs">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-icon-muted mb-1">Method</label>
              <select
                value={body.method || 'GET'}
                onChange={(e) => onChange({ Http: { ...body, method: e.target.value } })}
                className="w-full px-2 py-1.5 border border-bn-border rounded-bn bg-content-box text-foreground text-xs"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-icon-muted mb-1">Endpoint URL</label>
              <input
                type="text"
                value={body.url || ''}
                onChange={(e) => onChange({ Http: { ...body, url: e.target.value } })}
                className="w-full px-2 py-1.5 border border-bn-border rounded-bn bg-content-box text-foreground text-xs"
                placeholder="https://api.example.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-icon-muted mb-1">Request Body (JSON, Optional)</label>
            <textarea
              rows={2}
              value={body.body ? JSON.stringify(body.body, null, 2) : ''}
              onChange={(e) => {
                let parsed: any = undefined
                try { if (e.target.value) parsed = JSON.parse(e.target.value) } catch {}
                onChange({ Http: { ...body, body: parsed } })
              }}
              className="w-full p-2 border border-bn-border rounded-bn bg-content-box text-foreground text-xs font-mono resize-none"
              placeholder="{}"
            />
          </div>
        </div>
      )

    case 'Mutation':
      return (
        <div className="text-xs">
          <label className="block text-icon-muted mb-1">GraphQL Mutation</label>
          <textarea
            rows={3}
            value={body.query || ''}
            onChange={(e) => onChange({ Mutation: { ...body, query: e.target.value } })}
            className="w-full p-2 border border-bn-border rounded-bn bg-content-box text-foreground text-xs font-mono resize-none"
          />
        </div>
      )

    default:
      return <div className="text-xs text-icon-muted">Standard action configuration</div>
  }
}

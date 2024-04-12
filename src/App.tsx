import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ErrorMessage } from "@hookform/error-message"
import { useEffect, useState } from "react"
import { LoaderIcon } from "lucide-react"
import { Switch } from "@/components/ui/switch"

const schema = z.object({
  hourly_rate: z
    .string()
    .nonempty("Hourly rate is required")
    .refine((value) => !isNaN(parseFloat(value)), {
      message: "Hourly rate must be a number",
    })
    .refine((value) => parseFloat(value) > 0, {
      message: "Hourly rate must be greater than 0",
    })
})

async function reloadWindow() {
  const [tab] = await chrome.tabs.query({active: true, currentWindow: true})

  if (tab && tab.id) {
    chrome.scripting.executeScript({
      target: {tabId: tab.id},
      func: () => {
        window.location.reload()
      },
    })
  }
}

// async function log(...data: any[]) {
//   const [tab] = await chrome.tabs.query({active: true, currentWindow: true})

//   if (tab && tab.id) {
//     chrome.scripting.executeScript({
//       target: {tabId: tab.id},
//       func: (data) => {
//         console.log(data)
//       },
//       args: [data]
//     })
//   }
// }

function App() {

  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    (async () => {
      const rate = await chrome.storage.local.get('hourlyRate') as { hourlyRate: number | undefined }

      if (rate.hourlyRate) {
        form.setValue('hourly_rate', String(rate.hourlyRate))
      }
    })()
  }, [])

  const handleSubmit = form.handleSubmit(async (data) => {
    setIsSaving(true)
    await chrome.storage.local.set({'hourlyRate': data.hourly_rate})

    await reloadWindow()

    setTimeout(() => setIsSaving(false), 250)
  })

  return (
    <div className="min-w-64 min-h-96 flex flex-col gap-8 justify-center items-center p-4">
      <h2 className="text-lg drop-shadow text-center">Hourly Wage Price Converter</h2>

      <div className="flex flex-col gap-2">
        <EnabledToggle 
          toggleKey="enabled" 
          default={true}
          title="Enable"
        />

        <EnabledToggle 
          toggleKey="showOriginal" 
          default={false}
          title="Show Original"
        />
      </div>
      
      <Form {...form}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          <Label>Hourly Rate</Label>
          <Input
            placeholder="Enter your hourly rate"
            disabled={isSaving}
            {...form.register("hourly_rate")}
          />
          <ErrorMessage errors={form.formState.errors} name="hourly_rate" />

          <Button type="submit" disabled={isSaving} className="flex flex-row gap-2 justify-center items-center">
            <span>Save</span>
            {isSaving && <LoaderIcon className="w-4 h-4 animate-spin" />}
          </Button>

        </form>
      </Form>

    </div>
  )
}

type ToggleProps = {
  toggleKey: string;
  default: boolean;
  title: string;
}

const EnabledToggle = (props: ToggleProps) => {

  const [isEnabled, setIsEnabled] = useState<boolean | null>(null)

  useEffect(() => {
    chrome.storage.local.get(props.toggleKey, (data) => {
      // log({ data })
      setIsEnabled(data[props.toggleKey] ?? props.default)
    })
  }, [])

  const handleToggle = async (checked: boolean) => {
    setIsEnabled(checked)
    await chrome.storage.local.set({ [props.toggleKey]: checked })
    await reloadWindow()
  }

  return (
    <div className="flex flex-rol items-center gap-2">
      <Switch id="enabled" disabled={isEnabled === null} checked={isEnabled ?? props.default} onCheckedChange={handleToggle} />
      <Label htmlFor="enabled">{props.title}</Label>
    </div>
  )
}

export default App

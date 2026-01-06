"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Copy, Share2, RefreshCw, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function Home() {
  const [encodeInput, setEncodeInput] = useState("")
  const [encodedOutput, setEncodedOutput] = useState("")
  const [decodeInput, setDecodeInput] = useState("")
  const [decodedOutput, setDecodedOutput] = useState("")
  const [decodedError, setDecodedError] = useState("")
  const [copiedSection, setCopiedSection] = useState<string | null>(null)
  const { toast } = useToast()

  const handleEncode = () => {
    if (!encodeInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter a configuration URL",
        variant: "destructive",
      })
      return
    }

    try {
      const prefix = Math.random().toString(36).substring(2, 8)
      const suffix = Math.random().toString(36).substring(2, 8)
      const encoded = btoa(encodeInput)
      // Use | as delimiter between prefix, content, and suffix for reliable extraction
      const obfuscated = `${prefix}|${encoded}|${suffix}`

      setEncodedOutput(obfuscated)
      toast({
        title: "Success",
        description: "Configuration encoded successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to encode configuration",
        variant: "destructive",
      })
    }
  }

  const handleDecode = () => {
    if (!decodeInput.trim()) {
      setDecodedError("Please enter encoded text")
      setDecodedOutput("")
      return
    }

    try {
      const input = decodeInput.trim()

      // Extract content between delimiters
      const parts = input.split("|")

      if (parts.length === 3) {
        // Format: prefix|encoded|suffix
        const encoded = parts[1]
        try {
          const decoded = atob(encoded)
          setDecodedOutput(decoded)
          setDecodedError("")
          toast({
            title: "Success",
            description: "Configuration decoded successfully!",
          })
          return
        } catch (e) {
          // Continue to fallback
        }
      }

      throw new Error("Invalid encoded format")
    } catch (error) {
      setDecodedOutput("")
      setDecodedError("Failed to decode. Please check the encoded text.")
      toast({
        title: "Error",
        description: "Invalid encoded configuration",
        variant: "destructive",
      })
    }
  }

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedSection(section)
      setTimeout(() => setCopiedSection(null), 2000)
      toast({
        title: "Copied!",
        description: "Encoded text copied to clipboard",
      })
    })
  }

  // Share using Web Share API
  const handleShare = async (text: string, title: string) => {
    if (!navigator.share) {
      handleCopy(text, "share")
      return
    }

    try {
      await navigator.share({
        title: "Config Share",
        text: title,
        url: window.location.href,
      })
    } catch (error) {
      if (error instanceof Error && error.message !== "Share canceled") {
        toast({
          title: "Error",
          description: "Failed to share",
          variant: "destructive",
        })
      }
    }
  }

  // Clear and reset
  const handleClearEncode = () => {
    setEncodeInput("")
    setEncodedOutput("")
  }

  const handleClearDecode = () => {
    setDecodeInput("")
    setDecodedOutput("")
    setDecodedError("")
  }

  // Install PWA prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing
      e.preventDefault()
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-card/50 p-4 pb-8">
      <div className="max-w-2xl mx-auto space-y-6 pt-4">
        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            🥷 Shadow Paste
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Encode and decode configurations. Shareable, secure, offline-ready.
          </p>
        </div>

        {/* Encode Section */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                1
              </div>
              <h2 className="text-xl font-semibold">Encode Configuration</h2>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-foreground/80">Paste your configuration URL</label>
              <Textarea
                placeholder="vless://a8c5f2b1-9e7d-4f6a-8c3e-2b5d9a1f6e4c@vpn.example.com:443?type=ws&security=tls&path=%2Fvpnpath&host=vpn.example.com&fp=firefox&sni=vpn.example.com&alpn=h2#FastVPN"
                value={encodeInput}
                onChange={(e) => setEncodeInput(e.target.value)}
                className="font-mono text-sm bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground/50 min-h-24 resize-none"
              />

              <div className="flex gap-2">
                <Button onClick={handleEncode} className="flex-1 bg-primary hover:bg-primary/90 text-white" size="lg">
                  Encode
                </Button>
                <Button
                  onClick={handleClearEncode}
                  variant="outline"
                  className="border-border/50 bg-transparent"
                  size="lg"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {encodedOutput && (
              <div className="space-y-3 pt-4 border-t border-border/30">
                <label className="block text-sm font-medium text-foreground/80">
                  Your encoded configuration (shareable)
                </label>
                <div className="flex gap-2 mb-2">
                  <Button
                    onClick={() => handleCopy(encodedOutput, "encode")}
                    variant="outline"
                    size="sm"
                    className="border-border/50 bg-primary/10 hover:bg-primary/20 text-primary"
                  >
                    {copiedSection === "encode" ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span className="ml-2 text-xs">Copy</span>
                  </Button>
                  <Button
                    onClick={() => handleShare(encodedOutput, "Encoded Config")}
                    variant="outline"
                    size="sm"
                    className="border-border/50 bg-primary/10 hover:bg-primary/20 text-primary"
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="ml-2 text-xs">Share</span>
                  </Button>
                </div>
                <div className="relative">
                  <Textarea
                    value={encodedOutput}
                    readOnly
                    className="font-mono text-sm bg-background/50 border-border/50 text-foreground min-h-20 resize-none cursor-default"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  ✓ This text doesn't look like a configuration - perfect for sharing!
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border/30"></div>
          <span className="text-muted-foreground text-sm">or</span>
          <div className="flex-1 h-px bg-border/30"></div>
        </div>

        {/* Decode Section */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">
                2
              </div>
              <h2 className="text-xl font-semibold">Decode Configuration</h2>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-foreground/80">Paste the encoded configuration</label>
              <Textarea
                placeholder="Paste the encoded text here..."
                value={decodeInput}
                onChange={(e) => setDecodeInput(e.target.value)}
                className="font-mono text-sm bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground/50 min-h-24 resize-none"
              />

              <div className="flex gap-2">
                <Button
                  onClick={handleDecode}
                  className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                  size="lg"
                >
                  Decode
                </Button>
                <Button
                  onClick={handleClearDecode}
                  variant="outline"
                  className="border-border/50 bg-transparent"
                  size="lg"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {(decodedOutput || decodedError) && (
              <div className="space-y-3 pt-4 border-t border-border/30">
                <label className="block text-sm font-medium text-foreground/80">Decoded configuration</label>
                {decodedError && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                    {decodedError}
                  </div>
                )}
                {decodedOutput && (
                  <div>
                    <div className="flex gap-2 mb-2">
                      <Button
                        onClick={() => handleCopy(decodedOutput, "decode")}
                        variant="outline"
                        size="sm"
                        className="border-border/50 bg-accent/10 hover:bg-accent/20 text-accent"
                      >
                        {copiedSection === "decode" ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                        <span className="ml-2 text-xs">Copy</span>
                      </Button>
                    </div>
                    <div className="relative">
                      <Textarea
                        value={decodedOutput}
                        readOnly
                        className="font-mono text-sm bg-background/50 border-border/50 text-foreground min-h-20 resize-none cursor-default"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center space-y-2 pt-4">
          <p className="text-xs text-muted-foreground">
            🔒 All processing happens in your browser • 📱 Works offline • 🚀 No data is stored
          </p>
        </div>
      </div>
    </main>
  )
}

"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import {
  generateTelegramCode,
  getTelegramStatus,
  getActiveCode,
  disconnectTelegram,
  checkTelegramLinked,
} from "@/lib/telegram/actions";
import { getVerificationQRData } from "@/lib/telegram/qrcode-utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type ConnectionStatus =
  | { linked: false }
  | { linked: true; username: string | null; linkedAt: Date };

export default function TelegramConfigPage() {
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const initialLoadDone = useRef(false);

  const loadStatus = useCallback(async () => {
    try {
      const s = await getTelegramStatus();
      setStatus(s);
      return s;
    } catch (err) {
      console.error("Error loading Telegram status:", err);
      return null;
    }
  }, []);

  const loadActiveCode = useCallback(async () => {
    try {
      const active = await getActiveCode();
      if (active) {
        setCode(active.code);
        setExpiresAt(active.expiresAt);
        const dataUrl = await QRCode.toDataURL(
          getVerificationQRData(active.code, process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME),
          { width: 200, margin: 2, color: { dark: "#000", light: "#fff" } }
        );
        setQrDataUrl(dataUrl);
      } else {
        setCode(null);
        setExpiresAt(null);
        setQrDataUrl(null);
      }
    } catch (err) {
      console.error("Error loading active code:", err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;

    (async () => {
      setLoading(true);
      const s = await loadStatus();
      if (!s?.linked) {
        await loadActiveCode();
      }
      setLoading(false);
    })();
  }, [loadStatus, loadActiveCode]);

  // Polling for verification when not linked
  useEffect(() => {
    if (status?.linked) {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      return;
    }

    pollingRef.current = setInterval(async () => {
      try {
        const linked = await checkTelegramLinked();
        if (linked) {
          const s = await loadStatus();
          if (s?.linked) {
            setStatus(s);
            if (pollingRef.current) {
              clearInterval(pollingRef.current);
              pollingRef.current = null;
            }
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 5000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [status?.linked, loadStatus]);

  const handleGenerateCode = async () => {
    setGenerating(true);
    try {
      const result = await generateTelegramCode();
      setCode(result.code);
      setExpiresAt(result.expiresAt);
      const dataUrl = await QRCode.toDataURL(
        getVerificationQRData(result.code, process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME),
        { width: 200, margin: 2, color: { dark: "#000", light: "#fff" } }
      );
      setQrDataUrl(dataUrl);
    } catch (err) {
      console.error("Error generating code:", err);
    } finally {
      setGenerating(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectTelegram();
      setStatus({ linked: false });
      await loadActiveCode();
    } catch (err) {
      console.error("Error disconnecting:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-[fadeSlideIn_0.5s_ease-out]">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Telegram Bot</h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Conecta tu cuenta de Telegram con Zap AI
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  const isLinked = status?.linked;

  return (
    <div className="flex flex-col gap-6 animate-[fadeSlideIn_0.5s_ease-out]">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Telegram Bot</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Conecta tu cuenta de Telegram con Zap AI para consultar el CRM desde Telegram
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Estado de conexión */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Estado de conexión
              {isLinked ? (
                <Badge variant="default" className="bg-green-600">Vinculado</Badge>
              ) : (
                <Badge variant="secondary">No vinculado</Badge>
              )}
            </CardTitle>
            <CardDescription>
              {isLinked
                ? "Tu cuenta de Telegram está conectada"
                : "Vincula tu cuenta para usar Zap AI desde Telegram"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLinked ? (
              <>
                <div className="rounded-lg border bg-muted/40 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Cuenta:</span>
                    <span className="font-medium">
                      {status.username ? `@${status.username}` : "Telegram"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Vinculado desde:</span>
                    <span className="font-medium">
                      {new Date(status.linkedAt).toLocaleDateString("es-CO", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                <Button variant="destructive" onClick={handleDisconnect}>
                  Desvincular cuenta
                </Button>
              </>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Para vincular tu cuenta:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Genera un código de vinculación</li>
                  <li>Abre Telegram y busca el bot</li>
                  <li>Inicia el bot con /start</li>
                  <li>Envía el código mostrado</li>
                </ol>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Código de vinculación */}
        <Card>
          <CardHeader>
            <CardTitle>Código de vinculación</CardTitle>
            <CardDescription>
              {isLinked
                ? "Ya tienes una cuenta vinculada"
                : code
                  ? "Escanea el QR o copia el código y envíalo al bot de Telegram"
                  : "Genera un código para comenzar"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isLinked && (
              <>
                {code && qrDataUrl ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="rounded-lg border p-2 bg-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={qrDataUrl}
                        alt="QR Code para vincular Telegram"
                        className="size-48"
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">O envía este código al bot:</p>
                      <p className="text-3xl font-mono font-bold tracking-widest select-all">
                        {code}
                      </p>
                      {expiresAt && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Vence en {Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 60000))} min
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-sm text-muted-foreground">
                      Presiona &quot;Generar código&quot; para crear un nuevo código de vinculación
                    </p>
                  </div>
                )}
                <Button onClick={handleGenerateCode} disabled={generating} className="w-full">
                  {generating ? "Generando..." : code ? "Generar nuevo código" : "Generar código"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Instrucciones detalladas */}
      {!isLinked && (
        <Card>
          <CardHeader>
            <CardTitle>Instrucciones paso a paso</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              <li className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  1
                </span>
                <div>
                  <p className="font-medium">Genera un código</p>
                  <p className="text-sm text-muted-foreground">
                    Presiona el botón &quot;Generar código&quot; en esta página
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  2
                </span>
                <div>
                  <p className="font-medium">Abre Telegram</p>
                  <p className="text-sm text-muted-foreground">
                    Busca el bot de Certa Seguros e inicia la conversación con /start
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  3
                </span>
                <div>
                  <p className="font-medium">Envía el código</p>
                  <p className="text-sm text-muted-foreground">
                    Escanea el código QR o copia el código alfanumérico y envíalo al bot
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  4
                </span>
                <div>
                  <p className="font-medium">¡Listo!</p>
                  <p className="text-sm text-muted-foreground">
                    Una vez vinculado, podrás consultar el CRM directamente desde Telegram
                  </p>
                </div>
              </li>
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

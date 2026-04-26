"use client";

import { useEffect, useRef, useCallback, useId } from "react";
import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { cn } from "@lib/utils";
import { MarkdownRenderer } from "@/components/ui/markdown";
import { toolsMetadata } from "@/lib/tools/index";
import {
    Activity,
    ArrowLeft,
    Bell,
    Bot,
    Check,
    CircleUserRound,
    Command,
    Copy,
    File,
    FileText,
    ImageIcon,
    LayoutDashboard,
    LoaderIcon,
    Package,
    Paperclip,
    Receipt,
    SendIcon,
    Sparkles,
    Star,
    Target,
    UserPlus,
    Users,
    XIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as React from "react"
import Link from "next/link";

interface UseAutoResizeTextareaProps {
    minHeight: number;
    maxHeight?: number;
}

function useAutoResizeTextarea({
    minHeight,
    maxHeight,
}: UseAutoResizeTextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = useCallback(
        (reset?: boolean) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            if (reset) {
                textarea.style.height = `${minHeight}px`;
                return;
            }

            textarea.style.height = `${minHeight}px`;
            const newHeight = Math.max(
                minHeight,
                Math.min(
                    textarea.scrollHeight,
                    maxHeight ?? Number.POSITIVE_INFINITY
                )
            );

            textarea.style.height = `${newHeight}px`;
        },
        [minHeight, maxHeight]
    );

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = `${minHeight}px`;
        }
    }, [minHeight]);

    useEffect(() => {
        const handleResize = () => adjustHeight();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [adjustHeight]);

    return { textareaRef, adjustHeight };
}

interface CommandSuggestion {
    icon: React.ReactNode;
    label: string;
    description: string;
    prefix: string;
}

interface TextareaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    containerClassName?: string;
    showRing?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, containerClassName, showRing = true, ...props }, ref) => {
        const [isFocused, setIsFocused] = React.useState(false);

        return (
            <div className={cn(
                "relative",
                containerClassName
            )}>
                <textarea
                    className={cn(
                        "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
                        "transition-all duration-200 ease-in-out",
                        "placeholder:text-muted-foreground",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        showRing ? "focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0" : "",
                        className
                    )}
                    ref={ref}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    {...props}
                />

                {showRing && isFocused && (
                    <motion.span
                        className="absolute inset-0 rounded-md pointer-events-none ring-2 ring-offset-0 ring-primary/30"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    />
                )}
            </div>
        )
    }
)
Textarea.displayName = "Textarea"

function getMessageText(msg: { parts: Array<{ type: string; text?: string }> }): string {
    return msg.parts
        .filter((p): p is { type: "text"; text: string } => p.type === "text")
        .map((p) => p.text)
        .join("");
}

interface AttachmentFile {
    id: string;
    name: string;
    size: number;
    type: string;
    url?: string;
}

export function AnimatedAIChat({ backHref }: { backHref?: string }) {
    const { messages, sendMessage, status } = useChat({
      transport: new DefaultChatTransport({ api: "/api/chat" }),
    });
    
    const toolCallId = useId();
    const isStreaming = status === "streaming";
    const [value, setValue] = useState("");
    const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
    const [activeSuggestion, setActiveSuggestion] = useState<number>(-1);
    const [showCommandPalette, setShowCommandPalette] = useState(false);
    const [showToolsPanel, setShowToolsPanel] = useState(false);
    const [recentCommand, setRecentCommand] = useState<string | null>(null);
    const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 60,
        maxHeight: 200,
    });
    const [inputFocused, setInputFocused] = useState(false);
    const commandPaletteRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const allSuggestions: CommandSuggestion[] = [
        {
            icon: <Users className="w-4 h-4" />,
            label: "Ver Clientes",
            description: "Lista todos los clientes registrados",
            prefix: "/clientes"
        },
        {
            icon: <UserPlus className="w-4 h-4" />,
            label: "Prospectos Nuevos",
            description: "Muestra prospectos recién registrados",
            prefix: "/prospectos"
        },
        {
            icon: <FileText className="w-4 h-4" />,
            label: "Pólizas por Vencer",
            description: "Pólizas próximas a vencer",
            prefix: "/polizas"
        },
        {
            icon: <LayoutDashboard className="w-4 h-4" />,
            label: "Resumen del Negocio",
            description: "Dashboard ejecutivo",
            prefix: "/resumen"
        },
        {
            icon: <Receipt className="w-4 h-4" />,
            label: "Facturas Pendientes",
            description: "Facturas sin pagar",
            prefix: "/facturas"
        },
        {
            icon: <Target className="w-4 h-4" />,
            label: "Metas del Mes",
            description: "Progreso de objetivos comerciales",
            prefix: "/metas"
        },
        {
            icon: <Bell className="w-4 h-4" />,
            label: "Recordatorios",
            description: "Tareas y alertas pendientes",
            prefix: "/recordatorios"
        },
        {
            icon: <Activity className="w-4 h-4" />,
            label: "Actividad Reciente",
            description: "Últimos movimientos del sistema",
            prefix: "/actividad"
        },
        {
            icon: <Star className="w-4 h-4" />,
            label: "Clientes VIP",
            description: "Clientes destacados",
            prefix: "/vip"
        },
        {
            icon: <Package className="w-4 h-4" />,
            label: "Servicios",
            description: "Catálogo de seguros disponibles",
            prefix: "/servicios"
        },
    ];

    // Random subset for suggestion chips (deterministic SSR, randomized after mount)
    const firstChips = allSuggestions.slice(0, 4);
    const [randomChips, setRandomChips] = useState(firstChips);

    useEffect(() => {
        const shuffled = [...allSuggestions];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        setRandomChips(shuffled.slice(0, 4));
    }, []);

    const commandSuggestions = allSuggestions;

    const toolList = Object.values(toolsMetadata);

    useEffect(() => {
        if (value.startsWith('/') && !value.includes(' ')) {
            setShowCommandPalette(true);

            const matchingSuggestionIndex = commandSuggestions.findIndex(
                (cmd) => cmd.prefix.startsWith(value)
            );

            if (matchingSuggestionIndex >= 0) {
                setActiveSuggestion(matchingSuggestionIndex);
            } else {
                setActiveSuggestion(-1);
            }
        } else {
            setShowCommandPalette(false);
        }
    }, [value]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            const commandButton = document.querySelector('[data-command-button]');

            if (commandPaletteRef.current &&
                !commandPaletteRef.current.contains(target) &&
                !commandButton?.contains(target)) {
                setShowCommandPalette(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (showCommandPalette) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveSuggestion(prev =>
                    prev < commandSuggestions.length - 1 ? prev + 1 : 0
                );
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveSuggestion(prev =>
                    prev > 0 ? prev - 1 : commandSuggestions.length - 1
                );
            } else if (e.key === 'Tab' || e.key === 'Enter') {
                e.preventDefault();
                if (activeSuggestion >= 0) {
                    const selectedCommand = commandSuggestions[activeSuggestion];
                    setValue(selectedCommand.prefix + ' ');
                    setShowCommandPalette(false);

                    setRecentCommand(selectedCommand.label);
                    setTimeout(() => setRecentCommand(null), 2000);
                }
            } else if (e.key === 'Escape') {
                e.preventDefault();
                setShowCommandPalette(false);
            }
        } else if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (value.trim()) {
                handleSendMessage();
            }
        }
    };

    const handleSendMessage = () => {
        if (!value.trim()) return;
        
        const attachmentsData = attachments.length > 0 
            ? JSON.stringify(attachments.map(a => ({ name: a.name, type: a.type, size: a.size })))
            : undefined;
            
        const messageWithAttachments = attachmentsData 
            ? `${value.trim()} [Adjuntos: ${attachmentsData}]`
            : value.trim();
            
        sendMessage({ text: messageWithAttachments });
        setValue("");
        adjustHeight(true);
        setAttachments([]);
    };

    const handleAttachFile = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        Array.from(files).forEach(file => {
            const newFile: AttachmentFile = {
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name: file.name,
                size: file.size,
                type: file.type,
            };
            setAttachments(prev => [...prev, newFile]);
        });

        e.target.value = '';
    };

    const removeAttachment = (id: string) => {
        setAttachments((prev) => prev.filter((file) => file.id !== id));
    };

    const selectCommandSuggestion = (index: number) => {
        const selectedCommand = commandSuggestions[index];
        setValue(selectedCommand.prefix + ' ');
        setShowCommandPalette(false);

        setRecentCommand(selectedCommand.label);
        setTimeout(() => setRecentCommand(null), 2000);
    };

    const insertTool = (toolName: string) => {
        setValue(`/tool ${toolName} `);
        setShowToolsPanel(false);
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const getFileIcon = (type: string) => {
        if (type.startsWith('image/')) return <ImageIcon className="w-4 h-4" />;
        if (type === 'application/pdf') return <FileText className="w-4 h-4" />;
        return <File className="w-4 h-4" />;
    };

    return (
        <div className="flex flex-col w-full h-[100dvh] bg-background text-foreground relative overflow-hidden">
            {backHref && (
                <div className="hidden sm:flex absolute top-3 left-3 z-50">
                    <Link href={backHref}>
                        <motion.button
                            whileHover={{ x: -4, backgroundColor: "var(--accent)" }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full border border-border bg-accent/10 backdrop-blur-md text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-all shadow-xl"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span className="hidden sm:inline">Volver</span>
                        </motion.button>
                    </Link>
                </div>
            )}
            <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full mix-blend-normal filter blur-[128px] animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full mix-blend-normal filter blur-[128px] animate-pulse delay-700" />
                <div className="absolute top-1/4 right-1/3 w-64 h-64 bg-accent/10 rounded-full mix-blend-normal filter blur-[96px] animate-pulse delay-1000" />
            </div>
            
            <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.xls,.xlsx"
            />

            {messages.length === 0 ? (
                <div className="flex-1 flex items-center justify-center overflow-y-auto px-3 sm:px-6 relative z-10">
                    <motion.div
                        className="w-full max-w-2xl mx-auto"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                        <div className="text-center space-y-2 sm:space-y-3">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                                className="inline-block"
                            >
                                <h1 className="text-2xl sm:text-3xl font-medium tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/40 pb-1">
                                    How can I help today?
                                </h1>
                                <motion.div
                                    className="h-px bg-gradient-to-r from-transparent via-border to-transparent"
                                    initial={{ width: 0, opacity: 0 }}
                                    animate={{ width: "100%", opacity: 1 }}
                                    transition={{ delay: 0.5, duration: 0.8 }}
                                />
                            </motion.div>
                            <motion.p
                                className="text-xs sm:text-sm text-muted-foreground"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                Type a command or ask a question
                            </motion.p>
                        </div>
                    </motion.div>
                </div>
            ) : (
                <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar touch-auto scroll-smooth px-3 sm:px-6 pt-3 sm:pt-6 relative z-10">
                    <motion.div
                        className="w-full max-w-2xl mx-auto"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                        <div className="space-y-4 sm:space-y-6 pb-4">
                            {messages.map((msg, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    className={cn(
                                        "flex gap-2 sm:gap-4 p-3 sm:p-4 rounded-2xl group transition-all",
                                        msg.role === 'user'
                                            ? "bg-primary/5 border border-primary/10 ml-6 sm:ml-12"
                                            : "bg-muted/30 border border-border/50 mr-6 sm:mr-12"
                                    )}
                                >
                                    <div className={cn(
                                        "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 border",
                                        msg.role === 'user'
                                            ? "bg-primary/20 border-primary/30 text-primary-foreground"
                                            : "bg-accent/20 border-accent/30 text-foreground"
                                    )}>
                                        {msg.role === 'user' ? (
                                            <CircleUserRound className="w-4 h-4" />
                                        ) : (
                                            <Sparkles className="w-4 h-4" />
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            {msg.role === 'user' ? 'Tú' : 'Zap AI'}
                                        </div>
                                        {msg.role === 'user' ? (
                                            <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                                                {getMessageText(msg)}
                                            </p>
                                        ) : (
                                            <div className="relative">
                                                <MarkdownRenderer
                                                    content={getMessageText(msg) || (i === messages.length - 1 && isStreaming ? '' : '')}
                                                    className={cn(
                                                        "text-sm",
                                                        i === messages.length - 1 && isStreaming && "animate-pulse"
                                                    )}
                                                />
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(getMessageText(msg));
                                                        setCopiedMessageId(i);
                                                        setTimeout(() => setCopiedMessageId(null), 1500);
                                                    }}
                                                    className="absolute top-0 right-0 w-6 h-6 flex items-center justify-center rounded-md text-muted-foreground/40 hover:text-foreground hover:bg-accent/50 transition-all opacity-0 group-hover:opacity-100"
                                                    aria-label="Copiar mensaje"
                                                >
                                                    {copiedMessageId === i ? (
                                                        <Check className="w-3.5 h-3.5 text-green-500" />
                                                    ) : (
                                                        <Copy className="w-3.5 h-3.5" />
                                                    )}
                                                </button>
                                                {msg.role === 'assistant' && (msg as { parts: Array<{ type: string; toolInvocation?: { state: string } }> }).parts?.some(
                                                    (p: { type: string; toolInvocation?: { state: string } }) => p.type === 'tool-invocation' && p.toolInvocation?.state === 'call'
                                                ) && (
                                                    <motion.div
                                                        className="flex items-center gap-2 text-xs text-muted-foreground bg-accent/10 rounded-lg px-3 py-2 mt-2"
                                                        initial={{ opacity: 0, y: 5 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                    >
                                                        <LoaderIcon className="w-3 h-3 animate-spin" />
                                                        <span>Consultando datos...</span>
                                                    </motion.div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    </motion.div>
                </div>
            )}

            <div className="shrink-0 px-3 sm:px-6 pb-3 sm:pb-6 relative z-10">
                <div className="w-full max-w-2xl mx-auto">
                    <motion.div
                        className="relative backdrop-blur-2xl bg-card/60 sm:bg-card/40 rounded-2xl sm:rounded-2xl border border-border/50 shadow-2xl"
                        initial={{ scale: 0.98 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        <AnimatePresence>
                            {showCommandPalette && (
                                <motion.div
                                    ref={commandPaletteRef}
                                    className="absolute left-2 right-2 sm:left-4 sm:right-4 bottom-full mb-2 backdrop-blur-xl bg-popover/90 rounded-lg z-50 shadow-lg border border-border overflow-hidden"
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 5 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    <div className="py-1 bg-popover">
                                        {commandSuggestions.map((suggestion, index) => (
                                            <motion.div
                                                key={suggestion.prefix}
                                                className={cn(
                                                    "flex items-center gap-2 px-3 py-2 text-xs transition-colors cursor-pointer",
                                                    activeSuggestion === index
                                                        ? "bg-accent text-accent-foreground"
                                                        : "text-muted-foreground hover:bg-accent/50"
                                                )}
                                                onClick={() => selectCommandSuggestion(index)}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: index * 0.03 }}
                                            >
                                                <div className="w-5 h-5 flex items-center justify-center text-muted-foreground">
                                                    {suggestion.icon}
                                                </div>
                                                <div className="font-medium">{suggestion.label}</div>
                                                <div className="text-muted-foreground/60 text-xs ml-auto">
                                                    {suggestion.prefix}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="p-2 sm:p-4">
                            <Textarea
                                ref={textareaRef}
                                value={value}
                                onChange={(e) => {
                                    setValue(e.target.value);
                                    adjustHeight();
                                }}
                                onKeyDown={handleKeyDown}
                                onFocus={() => setInputFocused(true)}
                                onBlur={() => setInputFocused(false)}
                                placeholder="Ask zap a question..."
                                containerClassName="w-full"
                                className={cn(
                                    "w-full px-3 sm:px-4 py-2 sm:py-3",
                                    "resize-none",
                                    "bg-transparent",
                                    "border-none",
                                    "text-foreground/90 text-base sm:text-sm",
                                    "focus:outline-none",
                                    "placeholder:text-muted-foreground/30",
                                    "min-h-[48px] sm:min-h-[60px]"
                                )}
                                style={{
                                    overflow: "hidden",
                                }}
                                showRing={false}
                            />
                        </div>

                        <AnimatePresence>
                            {attachments.length > 0 && (
                                <motion.div
                                    className="px-2 sm:px-4 pb-2 sm:pb-3 flex gap-2 flex-wrap"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                >
                                    {attachments.map((file) => (
                                        <motion.div
                                            key={file.id}
                                            className="flex items-center gap-2 text-xs bg-accent/10 py-1.5 px-3 rounded-lg text-muted-foreground"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                        >
                                            <div className="w-4 h-4 flex items-center justify-center">
                                                {getFileIcon(file.type)}
                                            </div>
                                            <span className="max-w-[80px] sm:max-w-[100px] truncate">{file.name}</span>
                                            <span className="text-muted-foreground/50 text-[10px] hidden sm:inline">
                                                {formatFileSize(file.size)}
                                            </span>
                                            <button
                                                onClick={() => removeAttachment(file.id)}
                                                className="text-muted-foreground/40 hover:text-foreground transition-colors p-1"
                                            >
                                                <XIcon className="w-3 h-3" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="p-2 sm:p-4 border-t border-border/50 flex items-center justify-between gap-2 sm:gap-4">
                            <div className="flex items-center gap-1 sm:gap-3">
                                <motion.button
                                    type="button"
                                    onClick={handleAttachFile}
                                    whileTap={{ scale: 0.94 }}
                                    className="p-2 sm:p-2 text-muted-foreground/40 hover:text-foreground rounded-lg transition-colors relative group"
                                    aria-label="Adjuntar archivo"
                                >
                                    <Paperclip className="w-4 h-4" />
                                    <motion.span
                                        className="absolute inset-0 bg-accent/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                        layoutId="button-highlight"
                                    />
                                </motion.button>
                                <motion.button
                                    type="button"
                                    data-command-button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowCommandPalette(prev => !prev);
                                    }}
                                    whileTap={{ scale: 0.94 }}
                                    className={cn(
                                        "p-2 sm:p-2 text-muted-foreground/40 hover:text-foreground rounded-lg transition-colors relative group",
                                        showCommandPalette && "bg-accent/10 text-foreground"
                                    )}
                                    aria-label="Comandos"
                                >
                                    <Command className="w-4 h-4" />
                                    <motion.span
                                        className="absolute inset-0 bg-accent/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                        layoutId="button-highlight"
                                    />
                                </motion.button>
                                <motion.button
                                    type="button"
                                    data-tools-button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowToolsPanel(prev => !prev);
                                    }}
                                    whileTap={{ scale: 0.94 }}
                                    className={cn(
                                        "p-2 sm:p-2 text-muted-foreground/40 hover:text-foreground rounded-lg transition-colors relative group",
                                        showToolsPanel && "bg-accent/10 text-foreground"
                                    )}
                                    aria-label="Herramientas"
                                >
                                    <Bot className="w-4 h-4" />
                                    <motion.span
                                        className="absolute inset-0 bg-accent/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                        layoutId="button-highlight"
                                    />
                                </motion.button>
                            </div>

                            <motion.button
                                type="button"
                                onClick={handleSendMessage}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                disabled={isStreaming || !value.trim()}
                                className={cn(
                                    "px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                    "flex items-center gap-2",
                                    value.trim()
                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/10"
                                        : "bg-muted text-muted-foreground"
                                )}
                                aria-label="Enviar mensaje"
                            >
                                {isStreaming ? (
                                    <LoaderIcon className="w-4 h-4 animate-[spin_2s_linear_infinite]" />
                                ) : (
                                    <SendIcon className="w-4 h-4" />
                                )}
                                <span className="hidden sm:inline">Send</span>
                            </motion.button>
                        </div>
                    </motion.div>

                    <div className="hidden lg:flex flex-wrap items-center justify-center gap-2 mt-6">
                        {randomChips.map((suggestion, chipIdx) => (
                            <motion.button
                                key={suggestion.prefix}
                                onClick={() => {
                                    const idx = commandSuggestions.findIndex(s => s.prefix === suggestion.prefix);
                                    selectCommandSuggestion(idx);
                                }}
                                className="flex items-center gap-2 px-3 py-2 bg-accent/5 hover:bg-accent/10 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-all relative group"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: chipIdx * 0.1 }}
                            >
                                {suggestion.icon}
                                <span>{suggestion.label}</span>
                                <motion.div
                                    className="absolute inset-0 border border-border/50 rounded-lg"
                                    initial={false}
                                    animate={{
                                        opacity: [0, 1],
                                        scale: [0.98, 1],
                                    }}
                                    transition={{
                                        duration: 0.3,
                                        ease: "easeOut",
                                    }}
                                />
                            </motion.button>
                        ))}
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isStreaming && (
                    <motion.div
                        className="fixed bottom-20 sm:bottom-8 left-1/2 transform -translate-x-1/2 backdrop-blur-2xl bg-card/40 rounded-full px-3 sm:px-4 py-2 shadow-lg border border-border/50"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                    >
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-6 h-6 sm:w-8 sm:h-7 rounded-full bg-accent/20 flex items-center justify-center text-center">
                                <span className="text-[10px] sm:text-xs font-medium text-foreground/90 mb-0.5">zap</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                                <span className="hidden sm:inline">Respondiendo</span>
                                <span className="sm:hidden">...</span>
                                <TypingDots />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showToolsPanel && (
                    <>
                        <motion.div
                            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowToolsPanel(false)}
                        />
                        <motion.div
                            className="fixed bottom-0 left-0 right-0 sm:left-1/2 sm:top-1/2 sm:bottom-auto sm:right-auto sm:-translate-x-1/2 sm:-translate-y-1/2 backdrop-blur-2xl bg-card/95 sm:bg-card rounded-t-2xl sm:rounded-xl p-4 sm:p-6 shadow-2xl border-t sm:border border-border/50 z-50 sm:max-w-2xl sm:w-[90vw] sm:max-h-[80vh]"
                            initial={{ opacity: 0, y: 100 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 100 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-1 bg-border rounded-full mx-auto mb-2 sm:hidden" />
                                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                    Herramientas
                                </span>
                                <button
                                    onClick={() => setShowToolsPanel(false)}
                                    className="p-1.5 hover:bg-accent/50 rounded-lg transition-colors"
                                    aria-label="Cerrar panel"
                                >
                                    <XIcon className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 max-h-[50vh] sm:max-h-[60vh] overflow-y-auto custom-scrollbar px-0.5">
                                {toolList.map((tool) => (
                                    <button
                                        key={tool.name}
                                        onClick={() => {
                                            insertTool(tool.name);
                                            setShowToolsPanel(false);
                                        }}
                                        className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl hover:bg-accent/50 transition-colors text-center bg-accent/5 border border-border/30 hover:border-border/60"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                                            {tool.icon}
                                        </div>
                                        <div>
                                            <div className="text-xs font-medium text-foreground leading-tight">
                                                {tool.description}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground mt-0.5 hidden sm:block">
                                                {tool.name}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>


            {inputFocused && !window.matchMedia("(pointer: coarse)").matches && (
                <motion.div
                    className="fixed w-[50rem] h-[50rem] rounded-full pointer-events-none z-0 opacity-[0.05] bg-gradient-to-r from-primary via-secondary to-accent blur-[96px]"
                    animate={{
                        x: mousePosition.x - 400,
                        y: mousePosition.y - 400,
                    }}
                    transition={{
                        type: "spring",
                        damping: 25,
                        stiffness: 150,
                        mass: 0.5,
                    }}
                />
            )}
        </div>
    );
}

function TypingDots() {
    return (
        <div className="flex items-center ml-1">
            {[1, 2, 3].map((dot) => (
                <motion.div
                    key={dot}
                    className="w-1.5 h-1.5 bg-foreground/90 rounded-full mx-0.5"
                    initial={{ opacity: 0.3 }}
                    animate={{
                        opacity: [0.3, 0.9, 0.3],
                        scale: [0.85, 1.1, 0.85]
                    }}
                    transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        delay: dot * 0.15,
                        ease: "easeInOut",
                    }}
                    style={{
                        boxShadow: "0 0 4px var(--foreground)"
                    }}
                />
            ))}
        </div>
    );
}
import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { AlertTriangle, Flag, CheckCircle2 } from 'lucide-react';

interface ReportAvailabilityDialogProps {
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  title: string;
  providers?: Array<{ provider_name: string }>;
}

const REPORT_TYPES = [
  {
    value: 'wrong_provider' as const,
    label: 'Serviço incorreto',
    description: 'Listado em um serviço mas não está disponível lá',
    icon: '❌',
  },
  {
    value: 'missing_provider' as const,
    label: 'Serviço faltando',
    description: 'Disponível em um serviço que não aparece aqui',
    icon: '➕',
  },
  {
    value: 'wrong_price' as const,
    label: 'Preço incorreto',
    description: 'O preço de aluguel ou compra está errado',
    icon: '💰',
  },
  {
    value: 'broken_link' as const,
    label: 'Link quebrado',
    description: 'O link para o serviço de streaming não funciona',
    icon: '🔗',
  },
  {
    value: 'other' as const,
    label: 'Outro problema',
    description: 'Outro tipo de erro na disponibilidade',
    icon: '📝',
  },
];

export function ReportAvailabilityDialog({
  tmdbId,
  mediaType,
  title,
  providers,
}: ReportAvailabilityDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<typeof REPORT_TYPES[number]['value'] | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const submitReport = trpc.reports.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setTimeout(() => {
        setOpen(false);
        // Reset after close animation
        setTimeout(() => {
          setSubmitted(false);
          setSelectedType(null);
          setSelectedProvider('');
          setComment('');
        }, 300);
      }, 2000);
    },
    onError: () => {
      toast.error('Não foi possível enviar o report. Tente novamente.');
    },
  });

  const handleSubmit = () => {
    if (!selectedType) return;

    submitReport.mutate({
      tmdbId,
      mediaType,
      title,
      reportType: selectedType,
      providerName: selectedProvider || undefined,
      comment: comment.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-yellow-500 gap-1.5 text-xs"
        >
          <Flag className="h-3.5 w-3.5" />
          Reportar erro
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {submitted ? (
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold">Obrigado pelo report!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Sua contribuição ajuda a manter os dados atualizados.
              </p>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Reportar erro de disponibilidade
              </DialogTitle>
              <DialogDescription>
                Encontrou um erro nas informações de streaming de <strong>{title}</strong>? Nos ajude a corrigir!
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Report type selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo do problema</label>
                <div className="grid gap-2">
                  {REPORT_TYPES.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setSelectedType(type.value)}
                      className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-colors ${
                        selectedType === type.value
                          ? 'border-cyan-500 bg-cyan-500/10'
                          : 'border-border hover:border-muted-foreground/30 hover:bg-muted/50'
                      }`}
                    >
                      <span className="text-lg mt-0.5">{type.icon}</span>
                      <div>
                        <div className="text-sm font-medium">{type.label}</div>
                        <div className="text-xs text-muted-foreground">{type.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Provider selection (if applicable) */}
              {selectedType && (selectedType === 'wrong_provider' || selectedType === 'missing_provider' || selectedType === 'broken_link') && providers && providers.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {selectedType === 'missing_provider' ? 'Qual serviço está faltando?' : 'Qual serviço tem o problema?'}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {providers.map((p) => (
                      <button
                        key={p.provider_name}
                        onClick={() => setSelectedProvider(p.provider_name)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                          selectedProvider === p.provider_name
                            ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                            : 'border-border hover:border-muted-foreground/30'
                        }`}
                      >
                        {p.provider_name}
                      </button>
                    ))}
                    <button
                      onClick={() => setSelectedProvider('Outro')}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        selectedProvider === 'Outro'
                          ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                          : 'border-border hover:border-muted-foreground/30'
                      }`}
                    >
                      Outro
                    </button>
                  </div>
                </div>
              )}

              {/* Comment */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Detalhes (opcional)</label>
                <Textarea
                  placeholder="Descreva o problema com mais detalhes..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  maxLength={500}
                  rows={3}
                  className="resize-none"
                />
                <div className="text-xs text-muted-foreground text-right">
                  {comment.length}/500
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!selectedType || submitReport.isPending}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                {submitReport.isPending ? 'Enviando...' : 'Enviar report'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export const metadata = {
  title: "Sobre • Scripts.AI",
  description:
    "Saiba mais sobre o Scripts.AI — uma ferramenta gratuita que usa IA para gerar roteiros curtos, criativos e envolventes para Reels e TikTok.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white px-6 py-16">
      <div className="mx-auto max-w-3xl space-y-8">
        <h1 className="text-4xl font-bold text-center text-blue-400">
          Sobre o Scripts.AI
        </h1>

        <p className="text-slate-300 text-lg leading-relaxed">
          O <span className="font-semibold text-blue-400">Scripts.AI</span> é
          uma plataforma desenvolvida para criadores de conteúdo que desejam
          otimizar o processo de criação de vídeos curtos. Utilizando
          inteligência artificial, o sistema gera roteiros prontos para Reels,
          TikTok e Shorts com base em tema, tom e público desejado.
        </p>

        <p className="text-slate-300 text-lg leading-relaxed">
          Nosso objetivo é simplificar a produção de conteúdo, oferecendo uma
          solução rápida, gratuita e acessível para quem quer se destacar nas
          redes sociais. Você escolhe o assunto e o tom, e nós entregamos um
          roteiro completo em segundos.
        </p>

        <p className="text-slate-300 text-lg leading-relaxed">
          A ferramenta foi criada por{" "}
          <span className="text-blue-400 font-semibold">Altrix</span>, uma
          startup de tecnologia voltada à criação de soluções digitais e SaaS
          inovadoras.
        </p>

        <div className="border-t border-slate-700 pt-8 text-center">
          <p className="text-slate-400">
            💡 Dica: se quiser gerar voz profissional para seus roteiros, use o{" "}
            <a
              href="https://try.elevenlabs.io/jwv2p8j618ir"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              ElevenLabs
            </a>
            .
          </p>
        </div>
      </div>
    </main>
  );
}

import { SEO } from "@/components/SEO";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <SEO
        title="Política de Privacidade | Stream Radar"
        description="Política de Privacidade do Stream Radar. Saiba como coletamos, usamos e protegemos suas informações pessoais."
        url="/politica-de-privacidade"
      />

      <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Voltar ao início
      </Link>

      <article className="prose prose-invert max-w-none">
        <h1 className="text-3xl font-bold mb-2">Política de Privacidade</h1>
        <p className="text-muted-foreground text-sm mb-8">Última atualização: 10 de agosto de 2026</p>

        <p className="text-muted-foreground leading-relaxed mb-6">
          O <strong className="text-foreground">Stream Radar</strong> ("nós", "nosso" ou "site"), acessível em{" "}
          <a href="https://streamradar.com.br" className="text-primary hover:underline">streamradar.com.br</a>,
          tem como compromisso proteger a privacidade dos seus usuários. Esta Política de Privacidade descreve
          como coletamos, usamos, armazenamos e protegemos suas informações quando você utiliza nosso serviço.
        </p>

        <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">1. Informações que Coletamos</h2>
        
        <h3 className="text-lg font-medium text-foreground mt-6 mb-3">1.1 Informações fornecidas por você</h3>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
          <li>Dados de cadastro: nome e endereço de email (ao criar uma conta via login social)</li>
          <li>Preferências: lista de filmes/séries salvos, alertas configurados, avaliações e reviews</li>
          <li>Assinaturas de streaming que você indica possuir</li>
        </ul>

        <h3 className="text-lg font-medium text-foreground mt-6 mb-3">1.2 Informações coletadas automaticamente</h3>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
          <li>Dados de navegação: páginas visitadas, tempo de permanência, buscas realizadas</li>
          <li>Informações do dispositivo: tipo de navegador, sistema operacional, resolução de tela</li>
          <li>Endereço IP e localização aproximada (país/cidade)</li>
          <li>Cookies e tecnologias similares de rastreamento</li>
        </ul>

        <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">2. Como Usamos suas Informações</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">Utilizamos as informações coletadas para:</p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
          <li>Fornecer e melhorar nossos serviços de busca de conteúdo em streaming</li>
          <li>Personalizar sua experiência (recomendações, alertas de disponibilidade)</li>
          <li>Enviar notificações push sobre conteúdo da sua lista de interesse (quando autorizado)</li>
          <li>Analisar o uso do site para melhorias de performance e funcionalidades</li>
          <li>Exibir anúncios relevantes através do Google AdSense</li>
          <li>Cumprir obrigações legais e proteger nossos direitos</li>
        </ul>

        <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">3. Google AdSense e Publicidade</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Utilizamos o Google AdSense para exibir anúncios em nosso site. O Google AdSense utiliza cookies
          para veicular anúncios com base nas visitas anteriores do usuário ao nosso site ou a outros sites na internet.
        </p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
          <li>O Google usa cookies de publicidade (como o cookie DART) para exibir anúncios baseados em suas visitas a este e outros sites</li>
          <li>Você pode desativar o uso de cookies de publicidade visitando as{" "}
            <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Configurações de Anúncios do Google
            </a>
          </li>
          <li>Fornecedores terceirizados, incluindo o Google, usam cookies para veicular anúncios com base nas visitas anteriores do usuário</li>
          <li>Você pode desativar cookies de terceiros visitando a{" "}
            <a href="https://optout.networkadvertising.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              página de desativação da Network Advertising Initiative
            </a>
          </li>
        </ul>

        <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">4. Google Analytics</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Utilizamos o Google Analytics para analisar o uso do site. O Google Analytics coleta informações
          sobre como os visitantes usam o site, incluindo número de visitantes, páginas visitadas e tempo
          de permanência. Esses dados são agregados e anônimos. Para mais informações, consulte a{" "}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            Política de Privacidade do Google
          </a>.
        </p>

        <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">5. Cookies</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Cookies são pequenos arquivos de texto armazenados no seu dispositivo. Utilizamos cookies para:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
          <li><strong className="text-foreground">Cookies essenciais:</strong> necessários para o funcionamento do site (autenticação, sessão)</li>
          <li><strong className="text-foreground">Cookies de análise:</strong> Google Analytics para entender como o site é usado</li>
          <li><strong className="text-foreground">Cookies de publicidade:</strong> Google AdSense para exibir anúncios relevantes</li>
        </ul>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Você pode configurar seu navegador para recusar cookies, mas isso pode afetar a funcionalidade do site.
        </p>

        <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">6. Compartilhamento de Dados</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, exceto:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
          <li>Com provedores de serviços que nos auxiliam na operação do site (hospedagem, analytics)</li>
          <li>Com o Google para fins de publicidade (dados anônimos via cookies)</li>
          <li>Quando exigido por lei ou ordem judicial</li>
          <li>Para proteger nossos direitos, propriedade ou segurança</li>
        </ul>

        <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">7. Segurança dos Dados</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações,
          incluindo criptografia SSL/TLS, armazenamento seguro de senhas e controle de acesso. No entanto,
          nenhum método de transmissão pela internet é 100% seguro.
        </p>

        <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">8. Seus Direitos (LGPD)</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          De acordo com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018), você tem direito a:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
          <li>Confirmar a existência de tratamento de dados pessoais</li>
          <li>Acessar seus dados pessoais</li>
          <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
          <li>Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários</li>
          <li>Solicitar a portabilidade dos dados</li>
          <li>Revogar o consentimento a qualquer momento</li>
          <li>Solicitar a eliminação dos dados pessoais tratados com base no consentimento</li>
        </ul>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Para exercer qualquer um desses direitos, entre em contato conosco pelo email indicado abaixo.
        </p>

        <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">9. Retenção de Dados</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Mantemos suas informações pessoais enquanto sua conta estiver ativa ou conforme necessário
          para fornecer nossos serviços. Você pode solicitar a exclusão da sua conta e dados a qualquer momento.
        </p>

        <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">10. Menores de Idade</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Nosso serviço não é direcionado a menores de 13 anos. Não coletamos intencionalmente
          informações pessoais de crianças menores de 13 anos. Se tomarmos conhecimento de que
          coletamos dados de uma criança menor de 13 anos, tomaremos medidas para excluir essas informações.
        </p>

        <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">11. Links Externos</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Nosso site contém links para plataformas de streaming e outros sites externos. Não somos
          responsáveis pelas práticas de privacidade desses sites. Recomendamos que você leia as
          políticas de privacidade de cada site que visitar.
        </p>

        <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">12. Alterações nesta Política</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Podemos atualizar esta Política de Privacidade periodicamente. Quaisquer alterações serão
          publicadas nesta página com a data de atualização revisada. Recomendamos que você revise
          esta política regularmente.
        </p>

        <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">13. Contato</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Se você tiver dúvidas sobre esta Política de Privacidade ou sobre como tratamos seus dados, entre em contato:
        </p>
        <ul className="list-none text-muted-foreground space-y-1 mb-4">
          <li><strong className="text-foreground">Site:</strong> Stream Radar (streamradar.com.br)</li>
          <li><strong className="text-foreground">Email:</strong> contato@streamradar.com.br</li>
        </ul>

        <div className="mt-12 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Esta política está em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)
            e com as políticas do programa Google AdSense.
          </p>
        </div>
      </article>
    </div>
  );
}

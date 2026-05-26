import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  await prisma.ticket.deleteMany()
  await prisma.inspectionImage.deleteMany()
  await prisma.inspectionSignature.deleteMany()
  await prisma.inspection.deleteMany()
  await prisma.user.deleteMany()
  await prisma.manager.deleteMany()
  await prisma.role.deleteMany()
  await prisma.branch.deleteMany()
  await prisma.department.deleteMany()
  await prisma.portfolio.deleteMany()
  await prisma.directorate.deleteMany()

  const roles = [
    "Administrador", "Advogado", "Advogado Consultor", "Advogado Especialista",
    "Advogado Home Work", "Analista Administrativo", "Analista Administrativo Júnior",
    "Analista de Agentes Virtuais", "Analista de Agentes Virtuais e Uras",
    "Analista de Banco de Dados", "Analista de Bi Sênior", "Analista de Cobrança",
    "Analista de Control Desk", "Analista de Estatística e Modelagem",
    "Analista de Infraestrutura de Ti", "Analista de Infraestrutura Júnior",
    "Analista de Infraestrutura Pleno", "Analista de Infraestrutura Sênior",
    "Analista de Marketing Digital", "Analista de Mis", "Analista de Planejamento",
    "Analista de Processos", "Analista de Rh", "Analista de Rh Pleno",
    "Analista de Segurança da Informação Júnior",
    "Analista de Segurança da Informação Sênior",
    "Analista de Sistemas Asp e Asp Net", "Analista de Suporte Júnior",
    "Analista de Telecom", "Analista de Telecom Júnior",
    "Analista de Telecom Sênior", "Analista de Testes Júnior",
    "Analista de Testes Pleno", "Analista de Testes Sênior",
    "Analista de Treinamento", "Analista de Ux/Ui Junior",
    "Analista Desenvolvedor Júnior", "Analista Desenvolvedor Pleno",
    "Analista Desenvolvedor Sênior", "Analista Em Segurança da Informação",
    "Aprendiz Administrativo", "Aprendiz Operador de Cobrança",
    "Assessor Juridico", "Assistente Administrativo",
    "Assistente de Comunicação e Marketing", "Assistente de Control Desk",
    "Assistente de Criação", "Assistente de Planejamento",
    "Assistente de Retomados", "Assistente de Rh", "Assistente Jurídico",
    "Auxiliar Administrativo", "Auxiliar de Limpeza", "Auxiliar de Manutenção",
    "Auxiliar de Rh", "Business Partner", "Chefe de Serviço de Limpeza",
    "Consultor", "Consultor de Mis", "Consultor Digital",
    "Coordenador Administrativo", "Coordenador Controller",
    "Coordenador de Agentes Virtuais e Uras", "Coordenador de Bi",
    "Coordenador de Controldesk", "Coordenador de Finanças",
    "Coordenador de Gestão de Custos de Ti", "Coordenador de Planejamento",
    "Coordenador de Qualidade", "Coordenador de Recrutamento e Seleção",
    "Coordenador de Retomados", "Coordenador de Rh", "Coordenador de Sistemas",
    "Coordenador de Tecnologia", "Coordenador de Ux/Ui",
    "Coordenador Digital", "Coordenador Jurídico", "Cx Specialist",
    "Data Analyst", "Data Associate", "Data Consultant", "Data Specialist",
    "Diretor de Cobrança", "Diretor de Ti", "Diretor Executivo",
    "Diretor Juridico", "Enfermeiro do Trabalho", "Especialista de Cobrança",
    "Estagiário", "Estagiário Cobrança", "Estagiário Ti", "Gerente",
    "Gerente Administrativo", "Gerente de Bi",
    "Gerente de Canais e Projetos Digitais", "Gerente de Cobrança",
    "Gerente de Control Desk", "Gerente de Desenvolvimento de Sistemas",
    "Gerente de Governança de Dados", "Gerente de Leitura",
    "Gerente de Marketing", "Gerente de Mis", "Gerente de Planejamento",
    "Gerente de Prazos", "Gerente de Qualidade", "Gerente de Retomados",
    "Gerente de Tecnologia", "Gerente Executivo Administrativo",
    "Gerente Executivo de Cobrança", "Gerente Executivo de Controldesk",
    "Gerente Executivo de Desenvolvimento", "Gerente Executivo de Finanças",
    "Gerente Executivo de Gestão de Pessoas", "Gerente Executivo de Mis",
    "Gerente Executivo de Planejamento", "Gerente Executivo de Planejamento Digital",
    "Gerente Executivo Jurídico", "Localizador Externo", "Mis Tech Lead",
    "Monitor de Qualidade", "Multiplicador de Treinamento",
    "Negociador de Cobrança", "Negociador de Cobrança Digital",
    "Negociador Externo", "Operador de Telemarketing",
    "Superintendente Cobrança", "Superintendente Controller & Bi",
    "Superintendente de Gestão de Pessoas",
    "Superintendente de Segurança e Tecnologia",
    "Superintendente de Tecnologia e Inovação", "Superintendente de Telecom",
    "Supervisor de Cobrança", "Supervisor de Rh", "Supervisor de Service Desk",
    "Tecnico de Enfermagem", "Técnico de Segurança da Informação",
    "Técnico de Segurança do Trabalho", "Tecnico de Suporte",
    "Técnico de Suporte Júnior", "Técnico de Telecom", "Vigilante"
  ]

  for (const name of roles) {
    await prisma.role.create({ data: { name } })
  }
  console.log(`✓ ${roles.length} roles created`)

  const branches = [
    "Curitiba Park & Business", "Curitiba/CEBP", "Curitiba/Marechal",
    "Curitiba/Toronto", "Fortaleza/planalto", "HOME WORK", "Maringá"
  ]
  for (const name of branches) {
    await prisma.branch.create({ data: { name } })
  }
  console.log(`✓ ${branches.length} branches created`)

  const departments = [
    "Cobrança", "Cobrança - Digital", "Cobrança - Jurídica",
    "Cobrança - Securitizadoras", "Cobrança - Varejo Financeiro",
    "Contestações", "Dpto. Pessoal", "Encerramento Judicial",
    "Facilities e Infraestrutura", "Financeiro", "Gestão de Pessoas",
    "Iniciais", "Planejamento e Estratégia", "Prazos", "Qualidade",
    "Retomados", "Serviços de apoio jurídico", "Sucumbências", "Ti"
  ]
  for (const name of departments) {
    await prisma.department.create({ data: { name } })
  }
  console.log(`✓ ${departments.length} departments created`)

  const directorates = [
    "CRISITANE", "CRISITANE/ROGERIO", "FLAVIANO", "LUCIANO REIS",
    "PAULO HENRIQUE", "PIO JR", "ROSIANE", "SAULO"
  ]
  for (const name of directorates) {
    await prisma.directorate.create({ data: { name } })
  }
  console.log(`✓ ${directorates.length} directorates created`)

  const managers = [
    "Adriana Cristina Lucio", "Adriana Garutti Monteiro", "Adriana Teixeira de Bastos Mesquita", "Adriane Gabriele Benkovie Buchholtz", "Adriano Luiz Antunes",
    "Adriano Luiz Chiesorin", "Adriel Korbela", "Alan de Castro Moreira", "Alan Ferreira de Souza", "Aldrian Gabriel da Silva Carvalho",
    "Alessandra dos Santos", "Alessandria Beatriz Arruda Bighetti", "Alexandre Augusto Pinheiro", "Alexandre Marcio Siqueira Filho", "Alexssandra Batista Scremim",
    "Aline de Oliveira Rodrigues da Silva", "Aliston Henrique Rosa Marinho", "Allison Henrique Moro de Oliveira", "Alvaro Lambach Cardoso", "Alyson de Moura Souza",
    "Alysson Francisco Fagundes de Lima", "Amanda Beatriz Santos Colaco", "Amanda Karla Nogueira Mello Albuquerque Maranhao", "Amanda Urech Franquetti", "Ana Beatriz Barbosa Viana",
    "Ana Beatriz de Oliveira Rodrigues da Silva", "Ana Carolina Belleti", "Ana Carolina Janiski", "Ana Caroline Ferreira Santiago", "Ana Cecilia Xavier Honorio",
    "Ana Cristina Coelho de Mendonca", "Ana Isis Lopes dos Santos", "Ana Karoline Lemos Felix", "Ana Maria Vladcovski Soares", "Ana Paula Fagundes Boeno Pinto",
    "Anderson Luis de Freitas Nascimento", "Andre Airam Josete Camargosil Silveira", "Andrea Hertel Malucelli", "Andressa Candido Nassar", "Ane Caroline de Souza Bonete",
    "Angeline Barbosa Murawski", "Aretuze Evelin Aparecida da Silva", "Arthur Oliveira Urizze", "Augusto Ferreira Marcal", "Avelino Minatti Junior",
    "Beatriz Rejane da Silva Mota", "Bohdan Metchko Junior", "Brayan Willian Oliveira dos Santos", "Brenda dos Santos", "Bruna Feliciana de Souza",
    "Bruna Pereira Cardoso", "Bruna Xavier Gomes da Silva", "Bruno Thales de Oliveira", "Bryan Felipe Pereira da Silva", "Caio Davi dos Santos Honorato",
    "Camila Vasconcelos", "Camilla Rodrigues Machado Medeiros", "Carla Cristina de Paula Machado Freire", "Carla Forosteski Caballero", "Carmen Missfeld",
    "Caroline Aparecida Santiago Souza", "Cassiano Brum Val Grande", "Cesar Hani Issa", "Cibele Kozak Verissimo de Wallau", "Cristian Simons",
    "Cristiane Belinati Garcia Lopes", "Daiane da Silva Campagni", "Daiane Rocha da Costa", "Dandara Leal Oliveira", "Daniel Fragoso de Cuadra",
    "Daniela Cristina dos Santos", "Daniele Isidorio da Silva", "Daniele Luiza Ferreira", "Danielle de Lima Cosmo", "Danilo Delbone Gonzalez",
    "Darcio Ferreira Correa", "David Vidal do Carmo", "Debora Cristina Conci", "Deivid Pires dos Santos Junior", "Diego Barbosa Adao",
    "Diego Barbosa Ribeiro", "Douglas Rodrigues Pereira da Silva", "Eder Carlos Oliveira do Nascimento", "Ediley Mateus Carneiro dos Santos", "Eduarda Barboza de Lima",
    "Eduarda Jaqueline Kreniski", "Eduardo Augusto Ferreira Leal", "Eduardo Felipe Treska Nunes", "Elisa Aparecida Oliveira Anolaco", "Elisangela da Silva Moreira",
    "Elivelton Jose Cordeiro Sena", "Emerson Diogo Rodrigues Daniel", "Emerson Marcio Akamine", "Emerson Roberto Santana", "Escritorio Gomes - Angela Maria dos Santos Mourao",
    "Escritório Gomes - Kleber Junior de Figueiredo", "Escritorio Gomes - Maria Ap. dos Santos Domingos", "Estefhani Carolina de Manelli", "Ester da Silva Guterres", "Ester Holub da Luz",
    "Esther Bento Rocha de Souza", "Ewerton Kelvin de Melo Cordeiro", "Fabiano da Cruz Schinda", "Felipe Augusto Santos Borges", "Felipe Soares",
    "Fernanda Russo de Souza", "Fernanda Samara Bonifacio", "Fernanda Soares Pereira", "Fernando Augusto Burger", "Fernando Cesar de Oliveira – Tectris Business",
    "Flavia Camargo de Sousa Prado", "Flaviano Bellinati Garcia Perez", "Francisco Cleber da Silva Rocha", "Francisco Isaac Alves Neto", "Gabriel dos Santos Malaquias",
    "Gabriel Kaczur Ferraro", "Gabriel Krasnhak", "Gabriel Oliveira Batista Zatti", "Gabriela da Silva Rodrigues", "Gabriela de Jesus Santos",
    "Gabrielly de Freitas Silva Coelho", "Gabryel Henrique Bigarato da Silva", "Geovana Goncalves dos Santos", "Geovani Bruno Ramos Cazionato", "Geovanna Caetano de Oliveira",
    "Gilberto Borges da Silva", "Gisele Soares de Souza", "Giselle Carsten Sousa", "Gislaine Cristina Conche do Amaral", "Giulia Manoela Goncalves Luz Steenbock",
    "Guilherme do Nascimento da Silva", "Guilherme Lopes Faganelo", "Gustavo Bandeira Armstrong", "Gustavo Covolo Calcada", "Gustavo Rosseti Santos",
    "Haron Feliciano da Cruz", "Hellyvanya Eufrasio Lima Pedrosa", "Henrick Silva Pereira", "Hugo Lopes Garcia Mendes", "Iago dos Santos Carneiro",
    "Iago Rafael Felix Pinheiro", "Icaro Rogerio dos Santos Morais", "Ideleia Porto da Silva", "Indila Leticia Rodrigues Magalhaes", "Ingrid Seguro Bornancin",
    "Isabela de Souza Soares", "Isaias Valdecio Soares de Freitas", "Ivanildo Alves dos Santos", "Izabel Gehlen Schitz", "Izabela Rodrigues Yrie Benkendorf",
    "Izabely Cristina Rodrigues", "Jean Carlo Lopes Benkendorf", "Jefferson Barbosa Limeira", "Jefferson Ricardo Gaviorno de Andrade", "Jeine de Oliveira Lanza",
    "Jennyfer dos Santos de Souza", "Jessica dos Santos", "Jessica Ribas Castro", "Jheniffer Katherine Oliveira Rodrigues", "Jhonnatan Henrique dos Santos Domingues",
    "Jhonny Victor Ferrari Coito", "Joana Flavia Lopes de Souza", "Joao Felipe da Silva Carvalho", "Joao Fernando de Castro Silva", "Joao Henrique da Rocha",
    "Joao Henrique dos Santos da Rocha", "Joao Otavio Pires Fabro", "Joao Otavio Silva de Almeida", "Joao Victor Pappi Cesconetto", "Joao Victor Santos Almeida",
    "Joao Vitor Jarmuchewski", "Joel Marinho", "Joice Ferreira Goncalves", "Jose Aldenor de Castro Sousa Junior", "Jose Carlos de Almeida Machado",
    "Jose Guilherme Morais Ribeiro", "Jose Sidnei Fabrini", "Josiel Silva de Sousa", "Joyciano Silva de Araujo", "Julia de Araujo Moraes Barros",
    "Julia Francisca Barbosa Schleider", "Juliana Aparecida Bueno", "Juliana Cristina Druzian Ferreira", "Juliana Nascimento dos Santos", "Juliane Ribeiro da Silva",
    "Juliane T S Artigas dos Santos", "Julio Cesar Limao", "Karina Maziero da Silva", "Karla Antonia dos Santos Neves Silva", "Karla Beatriz Hoepfner",
    "Katia Regina Garcia", "Katiane Carvalho Cezar", "Kauane Candido dos Santos", "Kawanne Fernanda Ferreira", "Kelly Jaqueline Huzar",
    "Kelly Regina dos Santos", "Kemily Ribeiro Lacerda", "Kevelin Claudia dos Santos Vidal", "Keven Marinho de Oliveira", "Kimbeli de Lima Maximiano Roballo",
    "Kleicielly Cruz Cuban", "Lais Regina Sales da Silva", "Leandro Ramirez Braga", "Leonardo David Gariani", "Leonardo de Castro Oliveira",
    "Leonardo Henrique de Souza do Nascimento", "Leonardo Jose de Jesus dos Santos", "Leonardo Perez da Silva", "Lethycia Liermann Lune", "Livia Branco Del Masso",
    "Lorenna Zaratini Canhassi", "Luana Tiago de Oliveira", "Luann Andrey Bueno Silveira", "Lucas Alan da Silva", "Lucas Augustinho de Lara Sopschuk",
    "Lucas Gonçalves Ferreira", "Lucas Michell da Silva Roli", "Luciano Camargo dos Reis", "Lucimar Schelter Strey", "Luis Gustavo Nonato dos Santos",
    "Luiz Gustavo Barbosa Rodrigues", "Luiz Henrique Dearo Casagrande", "Luiz Pablo Araujo Souza", "Luiza Correa de Jesus", "Lusiana Sousa de Sales Lima",
    "Maicon Carvalho Rocha", "Marcia Ferreira Silva", "Marcio Lima Oliveira", "Marcos dos Santos", "Maria Carolina Dugonski",
    "Maria Claudia Stresser de Faria", "Maria Eduarda Cardoso de Britto Santos", "Maria Isabel Silva Barros", "Maria Luiza Rodrigues Pereira", "Maria Rita Magalhaes Borges",
    "Mariana Karoline Feliz Piccoli", "Mariana Vitoria Stacheski", "Marianne Fernanda Hubie", "Mateus Carvalho da Veiga", "Mateus Daniel Rodrigues Damasceno",
    "Matheus Crispim Moreira", "Matheus Eduardo Goncalves Arantes", "Mauricio Fiaux Fernandes", "Mehl Morais de Aquino", "Michel Antonio Bichibichi",
    "Micheli Janaina Fernandes", "Michelle Martins da Silva", "Milene Teixeira dos Santos", "Murilo Nicolack", "Mylena Alessandra Pim",
    "Mylena Martins de Melo", "Nadia Nara Justi Val", "Natalia Rodrigues", "Natasha Kimberly Vieira", "Nathasha Cristina Rossignatti Botti",
    "Nicolas Lima da Silva", "Nicole Ferreira Bestel", "Nicoli Thais dos Santos Mendel", "Nilseneia Domingues Militao da Rosa", "Oswaldo Lemos Faccioni",
    "Pamela dos Santos Ferreira", "Patricia Arruda", "Paula Cristina Cordeiro Swiech", "Paula Goulart Pimentel", "Paula Leticia de Carvalho Brito",
    "Paulo Eduardo da Silva Pedro", "Paulo Henrique Ferreira", "Paulo Roberto de Souza Junior", "Paulo Vinicius Bigi", "Pedro Henrique Kutz de Souza",
    "Rachel Bento Rocha de Souza", "Rafael Belinati Garcia Polimeni", "Rafael de Araujo Vidal", "Rafaele Aparecida Portela Leite", "Raissa Mara Alves Queiroz",
    "Raphael Victor Stocco Santos", "Raquel Lourenco de Araujo", "Rayana Caroline Gomes Damaceno", "Rayssa Savedra Floriani", "Renildo Monteiro do Nascimento",
    "Rhuan Carlos Manoel Martins", "Ricardo de Paula Zinke", "Ricardo Maglione Francelino", "Rillary Maiara Braine Silva", "Rodrigo Miranda Lullez",
    "Rodrigo Pacheco dos Santos Felisbino", "Rodrigo Theodoro Moreira", "Roger Saldanha Langner", "Rogerio Belinati Garcia Polimeni", "Ronaldo Henrique Morais Oliveira",
    "Ronaldo Rodrigues Dias", "Rosiane Aparecida Martinez", "Rosilandia Pereira de Souza", "Sabrina Cardoso Moreira", "Sabrina de Lima",
    "Sabrina Genipp", "Samanta de Souza Moreira", "Samuel Henrique de Oliveira Silva", "Samuel Muller Feustel", "Sara Collatino Soares de Moura",
    "Sara Vitoria Rodrigues Fagundes", "Saulo Madie de Melo", "Serena Belini Marcondes de Mello", "Sheila Dias dos Santos Izidorio", "Silvana Feiber",
    "Silvie Pouline Santos", "Stephanny Braga Lopes", "Stephany Catherine Putrique Silva", "Suelen Fernanda Santos da Silva", "Suellen dos Santos Frutuoso",
    "Suzanne Joucowski", "Talita Rodrigues Moreira", "Tatiane Borges de Mesquita", "Tatiane Soares Lima dos Santos", "Tauana Roberta de Paula",
    "Tayane Vieira Cordeiro", "Taynara Ines de Sousa", "Taynara Lara Vieira", "Thacyane Rodrigues Fanis", "Thaina Taele de Oliveira",
    "Thais Carolline Athayde Michak", "Thiago Jeferson dos Santos", "Thifany Amanda Dresseno", "Veridiana Prudencio Rafael", "Veridiane Lubacheski",
    "Veronica Jackeline Pereira Rolin", "Victor Hugo Miyashiro Alves", "Vinicios Fernandes Viana", "Vinicius Mansano Hollenweger", "Virginia Neusa Costa Mazzucco",
    "Virlani do Nascimento Soares", "Vivian Zubreski", "Wellyngton Roberto Gama", "Wesley Carvalho Cezar", "Wilker Lopes Arantes",
    "Willian Gabriel da Silva", "Williane Macieira de Almeida", "Yago Garcia Mendes Maeda", "Yasmin Cristine Canuto dos Santos", "Yasmin da Luz dos Santos"
  ]

  for (const name of managers) {
    await prisma.manager.create({ data: { name } })
  }
  console.log(`✓ ${managers.length} managers created`)

  const portfolios = [
    "Administrativo", "Alvarás", "Arc4U - Btg Pactual", "Arc4U - Btg Pactual Veículos",
    "Atração de Talentos", "Bradesco - Altos Valores", "Bradesco - Altos Valores Pj",
    "Bradesco - Carteira Comercial", "Bradesco - Digital", "Bradesco - Eavm Lp",
    "Bradesco - Eavm Pj", "Bradesco - Eavm Pj Lp", "Bradesco - Pj",
    "Bradesco - Pj Lp", "Bradesco - Telecobrança Banco", "Bradesco Eavm - Ca Pf",
    "Bradesco Phygital", "Bradesco Varejo", "BV", "Bv - Bom Pagador",
    "Bv - Cartões - F1", "Bv - Cl", "Bv - Consignado Inss", "Bv - Contencioso 1",
    "Bv - Contencioso 2", "Bv - Contencioso 3", "Bv - Massificado",
    "Bv - Reneg Consignados", "Bv - Solar", "Bv - Wo", "C6 Auto", "C6 Bank",
    "C6 Bank - Ajuizados Varejo", "C6 Bank - Atendimento Receptivo",
    "C6 Bank - Cartão Ativo", "C6 Bank - Cartão Cancelado", "C6 Bank - Cp e Ce",
    "C6 Bank - Reneg", "Casas Bahia - Banqi", "Casas Bahia - Dg",
    "Casas Bahia - Fixa", "Casas Bahia - Reativa Cdc", "Casas Bahia - Recovery",
    "Célula de Inovação", "Cobplan", "Comunicação e Marketing",
    "Contas A Pagar", "Contestação", "Controladoria", "Controldesk",
    "Controllership", "Crefaz", "Crefaz - Energia", "Crefaz - Produtos",
    "Desenvolvimento de Sistemas", "Desenvolvimento Organizacional", "Diretoria",
    "Dpto. Pessoal", "Engenharia de Dados", "Estratégia Bradesco",
    "Estratégia Bv", "Estratégia C6", "Estratégia Casas Bahia", "Estratégia Itaú",
    "Estratégia Mercado Pago", "Estratégia Pan", "Estratégia Recovery",
    "Estratégia Renner", "Estratégia Santander", "Execução de Sucumbência",
    "Facilities", "Financeiro", "Fiscal", "Fornecedores - Ti",
    "Gestão de Cultura e Liderança", "Gestão de Incentivos",
    "Gestão de Infraestrutura e Espaços", "Gestão Itaú Colchão",
    "Governança de Ti", "Honda", "Honda - Pa Fixa", "Honorários", "Infra",
    "Iniciais", "Itaú", "Itaú - Atraso Curto Bpf", "Itaú - Personnalité",
    "Itaú - Personnalité Colchão", "Itaú - Pj", "Itaú - Pj - Pesados",
    "Itaú Acc", "Itaú Bpf - Colchão", "Itaú Bpf - Colchão Indireto",
    "Itaú Cartões - Colchão", "Itaú Cartões - Colchão Indireto", "Itau Varejo",
    "Leitura - Dj", "Liberação Para Venda", "Limpeza e Conservação",
    "Magalu - Telecobrança", "Manutenção Predial", "Medicina e Saúde do Trabalho",
    "Méliuz - Ca", "Méliuz - Cl", "Mercado Pago - Consumer",
    "Mercado Pago - Consumer Pa Fixa", "Mercado Pago - Merchant",
    "Mercado Pago - Tarjeta de Crédito", "Mercado Pago - Tarjeta de Crédito Pa Fixa",
    "Mercado Pago - Wo", "Mis", "Monitoria", "Pan", "Pan - Ajuizados",
    "Pan - Ativas", "Pan - Wo", "Pan Contact", "Pc", "Picpay", "Porto Seguro",
    "Porto Seguro - Cartão Ajuizado", "Porto Seguro - Cartão Contencioso",
    "Porto Seguro - Com Garantia", "Porto Seguro - E&F", "Porto Seguro - Pj",
    "Porto Seguro - Sem Garantia", "Prazos Filiais", "Protocolo Jurídico",
    "Recovery", "Recovery - Veículos", "Recursos", "Reembolso",
    "Relações Sindicais / Trabalhistas", "Remoção", "Renner", "Renner Wo",
    "Santander - Financeira", "Santander - Hyundai", "Santander - Rci",
    "Santander - Return", "Santander - Sim Cp e Sim Consumer",
    "Santander Varejo - Over Pf", "Santander Varejo - Over Pj",
    "Segurança da Informação", "Segurança Patrimonial",
    "Serviço de Apoio (Recepção)", "Setor Compras", "Solicitação de Guias",
    "Suporte", "Tecnologia da Informação", "Telecom", "Tesouraria",
    "Transformação Digital", "Whatsapp"
  ]
  for (const name of portfolios) {
    await prisma.portfolio.create({ data: { name } })
  }
  console.log(`✓ ${portfolios.length} portfolios created`)

  // Buscar registros criados para obter IDs reais (evitando falha caso os IDs autoincrementais tenham avançado)
  const defaultRole = await prisma.role.findFirst({ where: { name: "Administrador" } }) || await prisma.role.findFirst()
  const inspectorRole = await prisma.role.findFirst({ where: { name: "Analista de Cobrança" } }) || await prisma.role.findFirst()
  const defaultBranch = await prisma.branch.findFirst()
  const defaultDepartment = await prisma.department.findFirst()
  const defaultPortfolio = await prisma.portfolio.findFirst()
  const defaultDirectorate = await prisma.directorate.findFirst()

  const adminPassword = bcrypt.hashSync("admin123", 10)
  await prisma.user.create({
    data: {
      fullName: "Administrador",
      nickname: "Admin",
      cpf: "000.000.000-00",
      email: "admin@vistoriabp.com",
      password: adminPassword,
      roleId: defaultRole?.id,
      branchId: defaultBranch?.id,
      departmentId: defaultDepartment?.id,
      portfolioId: defaultPortfolio?.id,
      directorateId: defaultDirectorate?.id,
    },
  })
  console.log("✓ Admin user created (admin@vistoriabp.com / admin123)")

  const inspectorPassword = bcrypt.hashSync("inspetor123", 10)
  await prisma.user.create({
    data: {
      fullName: "João Silva",
      nickname: "João",
      cpf: "111.111.111-11",
      email: "joao@vistoriabp.com",
      password: inspectorPassword,
      roleId: inspectorRole?.id,
      branchId: defaultBranch?.id,
      departmentId: defaultDepartment?.id,
      portfolioId: defaultPortfolio?.id,
      directorateId: defaultDirectorate?.id,
    },
  })
  console.log("✓ Inspector user created (joao@vistoriabp.com / inspetor123)")
}

main()
  .then(() => {
    console.log("Seed completed!")
    return prisma.$disconnect()
  })
  .catch((e) => {
    console.error(e)
    return prisma.$disconnect()
    .then(() => process.exit(1))
  })

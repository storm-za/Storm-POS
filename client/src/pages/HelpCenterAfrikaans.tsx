import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingCart, Package, Users, FileText, BarChart3, CreditCard, Settings, Receipt, HelpCircle, User, Globe } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export function HelpCenterAfrikaans() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] pointer-events-none"></div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="mb-4 text-white hover:text-[hsl(217,90%,40%)] hover:bg-white/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Terug na POS
          </Button>
          
          <div className="bg-gradient-to-r from-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)] rounded-2xl px-8 py-6 shadow-2xl shadow-blue-900/50 border border-blue-400/20">
            <div className="flex items-center space-x-4">
              <HelpCircle className="h-12 w-12 text-white" />
              <div>
                <h1 className="text-3xl font-bold text-white">Hoe om Storm POS te Gebruik</h1>
                <p className="text-blue-100 mt-1">Volledige gids vir alle funksies en funksionaliteit</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <div className="space-y-6">
          {/* Sales Tab */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gray-800/50 backdrop-blur-xl border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white text-2xl">
                  <ShoppingCart className="mr-3 h-6 w-6 text-[hsl(217,90%,40%)]" />
                  Verkope Oortjie
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Verwerk 'n Verkoop</h3>
                  <ol className="list-decimal list-inside space-y-2 ml-4">
                    <li>Blaai of soek produkte in die linker paneel met die soekbalk</li>
                    <li>Klik op 'n produk om dit by die huidige verkoop te voeg</li>
                    <li>Stel hoeveelhede aan met die + en - knoppies, of klik die asblik ikoon om 'n item te verwyder</li>
                    <li>Kies 'n kliënt (opsioneel) uit die aftreklys om kliënt-spesifieke pryse toe te pas</li>
                    <li>Kies 'n betaalmetode: Kontant, Kaart, of EFT</li>
                    <li>Voeg verkoopnotas by indien nodig vir interne verwysing</li>
                    <li>Pas afslag toe deur die bedrag of persentasie in te voer</li>
                    <li>Aktiveer "Fooi Opsie" as jy wil hê die kwitansie moet fooilyne vir kelners insluit</li>
                    <li>Klik "Voltooi Verkoop" om af te handel en die kwitansie te druk</li>
                  </ol>
                </div>
                
                <Separator className="bg-gray-700" />
                
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Kliënt Keuse</h3>
                  <p>Wanneer jy 'n kliënt kies, verskyn hul inligting onder die aftreklys insluitend:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>Kliënt naam en tipe (Kleinhandel of Handel)</li>
                    <li>Telefoonnommer (indien beskikbaar)</li>
                    <li>Kliënt notas (indien beskikbaar)</li>
                    <li>Handelkliënte ontvang outomaties handelspryse indien gekonfigureer</li>
                  </ul>
                </div>

                <Separator className="bg-gray-700" />

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Afslag Opsies</h3>
                  <p>Pas afslag toe op twee maniere:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li><strong>Vaste Bedrag:</strong> Voer 'n rand waarde in (bv. 50 vir R50 af)</li>
                    <li><strong>Persentasie:</strong> Voer 'n persentasie gevolg deur % in (bv. 10% vir 10% af)</li>
                  </ul>
                  <p className="mt-2">Die afslag word toegepas op die totaal voor voltooiing van die verkoop.</p>
                </div>

                <Separator className="bg-gray-700" />

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Fooi Opsie</h3>
                  <p>Aktiveer die "Fooi Opsie" merkie wanneer verkope vir tafeldiens verwerk word:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>Kwitansie sal leë lyne insluit vir "Fooi: _______" en "Nuwe Totaal: _______"</li>
                    <li>Kliënte kan fooibedrae met die hand invul</li>
                    <li>Perfek vir kelners en tafeldiens scenarios</li>
                    <li>Die opsie herstel na elke verkoop om onbedoelde gebruik te voorkom</li>
                  </ul>
                </div>

                <Separator className="bg-gray-700" />

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Kitsdrukreeks</h3>
                  <p>Gebruik "Kitsdruk" vir kombuisbestellings of interne rekords:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>Druk 'n vereenvoudigde kwitansie sonder om die verkoop te voltooi</li>
                    <li>Trek nie van voorraad af of rekord die transaksie nie</li>
                    <li>Nuttig om bestellings na die kombuis te stuur voor betaling</li>
                    <li>Sluit nie fooilyne in nie (slegs interne gebruik)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Products Tab */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gray-800/50 backdrop-blur-xl border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white text-2xl">
                  <Package className="mr-3 h-6 w-6 text-[hsl(217,90%,40%)]" />
                  Produkte Oortjie
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Voeg 'n Nuwe Produk By</h3>
                  <ol className="list-decimal list-inside space-y-2 ml-4">
                    <li>Klik die "Voeg Produk By" knoppie</li>
                    <li>Vul die vereiste velde in:
                      <ul className="list-disc list-inside ml-6 mt-1">
                        <li><strong>SKU:</strong> Unieke produkkode vir identifikasie</li>
                        <li><strong>Naam:</strong> Produknaam soos dit op kwitansies verskyn</li>
                        <li><strong>Kosteprys:</strong> Wat jy vir die produk betaal het</li>
                        <li><strong>Kleinhandelprys:</strong> Standaard verkoopprys</li>
                        <li><strong>Handelsprys (Opsioneel):</strong> Afslag prys vir handelskliënte</li>
                        <li><strong>Hoeveelheid:</strong> Huidige voorraadvlak</li>
                      </ul>
                    </li>
                    <li>Klik "Voeg Produk By" om te stoor</li>
                  </ol>
                </div>

                <Separator className="bg-gray-700" />

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Bestuur Produkte</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Soek:</strong> Gebruik die soekbalk om produkte te filtreer volgens naam of SKU</li>
                    <li><strong>Wysig:</strong> Klik die wysig knoppie om produkbesonderhede of voorraadvlakke aan te pas</li>
                    <li><strong>Verwyder:</strong> Verwyder produkte wat nie meer verkoop word nie (vereis bevestiging)</li>
                    <li><strong>Lae Voorraad Waarskuwing:</strong> Produkte met hoeveelheid ≤ 5 vertoon 'n geel waarskuwingsmerk</li>
                  </ul>
                </div>

                <Separator className="bg-gray-700" />

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Pryse Tipes</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>Kleinhandelprys:</strong> Gevra van gewone kliënte</li>
                    <li><strong>Handelsprys:</strong> Outomaties toegepas wanneer 'n handelskliënt in verkope gekies word</li>
                    <li>As geen handelsprys gestel is nie, word kleinhandelprys vir alle kliënte gebruik</li>
                  </ul>
                </div>

                <Separator className="bg-gray-700" />

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Voorraadbestuur</h3>
                  <p>Voorraadvlakke werk outomaties op wanneer verkope voltooi word:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>Hoeveelhede word afgetrek wanneer 'n verkoop gefinaliseer word</li>
                    <li>Kitsdrukke affekteer nie voorraad nie</li>
                    <li>Monitor voorraadvlakke om produkte te herbestel voor hulle opraak</li>
                    <li>Wysig produkhoeveelhede handmatig wanneer nuwe voorraad ontvang word</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Customers Tab */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gray-800/50 backdrop-blur-xl border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white text-2xl">
                  <Users className="mr-3 h-6 w-6 text-[hsl(217,90%,40%)]" />
                  Kliënte Oortjie
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Voeg 'n Kliënt By</h3>
                  <ol className="list-decimal list-inside space-y-2 ml-4">
                    <li>Klik "Voeg Kliënt By" knoppie</li>
                    <li>Voer kliëntbesonderhede in:
                      <ul className="list-disc list-inside ml-6 mt-1">
                        <li><strong>Naam:</strong> Kliënt se volle naam of besigheidsnaam</li>
                        <li><strong>Telefoon:</strong> Kontaknommer vir kommunikasie</li>
                        <li><strong>Kliënt Tipe:</strong> Kies Kleinhandel of Handel
                          <ul className="list-circle list-inside ml-6 mt-1">
                            <li>Kleinhandel: Standaard pryse geld</li>
                            <li>Handel: Kry handelspryse wanneer gestel op produkte</li>
                          </ul>
                        </li>
                        <li><strong>Notas (Opsioneel):</strong> Stoor voorkeure, rekeningbesonderhede, of spesiale instruksies</li>
                      </ul>
                    </li>
                    <li>Klik "Voeg Kliënt By" om te stoor</li>
                  </ol>
                </div>

                <Separator className="bg-gray-700" />

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Bestuur Kliënte</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Bekyk:</strong> Sien alle kliëntbesonderhede insluitend tipe merk (Kleinhandel/Handel)</li>
                    <li><strong>Wysig:</strong> Werk kliëntinligting op of verander hul tipe</li>
                    <li><strong>Verwyder:</strong> Verwyder kliënte van die stelsel (vereis bevestiging)</li>
                    <li><strong>Notas:</strong> Voeg herinneringe by soos "Verkies oggend aflewering" of "Rekening #12345"</li>
                  </ul>
                </div>

                <Separator className="bg-gray-700" />

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Kliënt Tipes Verduidelik</h3>
                  <div className="space-y-3 ml-4">
                    <div>
                      <p className="font-semibold text-blue-400">Kleinhandel Kliënte</p>
                      <ul className="list-disc list-inside ml-4">
                        <li>Individuele kopers of inwoners</li>
                        <li>Betaal kleinhandelprys vir alle produkte</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-green-400">Handel Kliënte</p>
                      <ul className="list-disc list-inside ml-4">
                        <li>Groothandel kopers, herverkopers, of grootmaat aankope</li>
                        <li>Ontvang outomaties handelspryse wanneer produkte dit gekonfigureer het</li>
                        <li>Ideaal vir besighede wat koop vir herverkoop</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Open Accounts Tab */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gray-800/50 backdrop-blur-xl border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white text-2xl">
                  <FileText className="mr-3 h-6 w-6 text-[hsl(217,90%,40%)]" />
                  Oop Rekeninge Oortjie
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Wat is Oop Rekeninge?</h3>
                  <p>Oop rekeninge laat jou toe om onbetaalde rekening vir kliënte na te spoor wat later sal betaal (bv. tafeldiens, korporatiewe rekeninge).</p>
                </div>

                <Separator className="bg-gray-700" />

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Skep 'n Oop Rekening</h3>
                  <ol className="list-decimal list-inside space-y-2 ml-4">
                    <li>Klik "Maak Nuwe Rekening Oop"</li>
                    <li>Voer rekeningbesonderhede in:
                      <ul className="list-disc list-inside ml-6 mt-1">
                        <li><strong>Kliënt Naam:</strong> Wie besit hierdie rekening</li>
                        <li><strong>Tafel/Verwysing:</strong> Tafelnommer, kamernommer, of rekening verwysing</li>
                        <li><strong>Notas:</strong> Spesiale instruksies of herinneringe</li>
                      </ul>
                    </li>
                    <li>Klik "Skep Rekening"</li>
                  </ol>
                </div>

                <Separator className="bg-gray-700" />

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Voeg Items by 'n Rekening</h3>
                  <ol className="list-decimal list-inside space-y-2 ml-4">
                    <li>Vind die oop rekening in die lys</li>
                    <li>Klik "Voeg Items By"</li>
                    <li>Kies produkte net soos in die Verkope oortjie</li>
                    <li>Items word by die lopende rekening gevoeg</li>
                    <li>Totaal werk outomaties op</li>
                  </ol>
                </div>

                <Separator className="bg-gray-700" />

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Sluit 'n Rekening</h3>
                  <p>Wanneer die kliënt gereed is om te betaal:</p>
                  <ol className="list-decimal list-inside space-y-2 ml-4 mt-2">
                    <li>Klik "Sluit & Betaal" op die rekening</li>
                    <li>Hersien alle items op die rekening</li>
                    <li>Kies betaalmetode (Kontant, Kaart, of EFT)</li>
                    <li>Aktiveer "Fooi Opsie" indien nodig vir kelnerfooie</li>
                    <li>Pas afslag toe indien van toepassing</li>
                    <li>Klik "Voltooi Betaling"</li>
                    <li>Kwitansie word gegenereer en voorraad word opgedateer</li>
                  </ol>
                </div>

                <Separator className="bg-gray-700" />

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Bestuur Oop Rekeninge</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Bekyk Besonderhede:</strong> Sien alle items op 'n rekening en lopende totaal</li>
                    <li><strong>Voeg Meer Items By:</strong> Hou aan om by die rekening te voeg</li>
                    <li><strong>Verwyder Rekening:</strong> Kanselleer 'n rekening (affekteer nie voorraad nie)</li>
                    <li>Rekeninge bly oop totdat handmatig gesluit of verwyder</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Reports Tab */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-gray-800/50 backdrop-blur-xl border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white text-2xl">
                  <BarChart3 className="mr-3 h-6 w-6 text-[hsl(217,90%,40%)]" />
                  Verslae Oortjie
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Verkope Ontleding Paneelbord</h3>
                  <p>Kry omvattende insigte in jou verkoopsprestasie:</p>
                </div>

                <Separator className="bg-gray-700" />

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Datum Filtrering</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Kies enige datum om verkope vir daardie spesifieke dag te sien</li>
                    <li>Verstek na vandag se verkope</li>
                    <li>Alle grafieke en metings werk op gebaseer op gekose datum</li>
                  </ul>
                </div>

                <Separator className="bg-gray-700" />

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Opsomming Kaarte</h3>
                  <p>Vier sleutel metings vertoon aan die bokant:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li><strong>Totale Inkomste:</strong> Som van alle verkope (uitsluitend gekanselleerde verkope)</li>
                    <li><strong>Transaksies:</strong> Aantal voltooide verkope</li>
                    <li><strong>Gem. Transaksie:</strong> Gemiddelde verkoopwaarde</li>
                    <li><strong>Betaling Verdeling:</strong> Verspreiding oor Kontant/Kaart/EFT</li>
                  </ul>
                </div>

                <Separator className="bg-gray-700" />

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Grafieke</h3>
                  <div className="space-y-3 ml-4">
                    <div>
                      <p className="font-semibold text-blue-400">Betaalmetodes (Sirkelgrafiek)</p>
                      <p className="ml-4">Visuele verdeling wat persentasie van elke betalingstipe wys</p>
                    </div>
                    <div>
                      <p className="font-semibold text-blue-400">7-Dag Tendens (Lyngrafiek)</p>
                      <p className="ml-4">Wys daaglikse inkomste oor die afgelope 7 dae om tendense op te spoor</p>
                    </div>
                  </div>
                </div>

                <Separator className="bg-gray-700" />

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Verkope Lys</h3>
                  <p>Gedetailleerde tabel van alle transaksies wat wys:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>Verkoop ID en tydstempel</li>
                    <li>Totale bedrag en betaalmetode</li>
                    <li>Kliënt naam (indien aangeteken)</li>
                    <li>Personeellid wat die verkoop verwerk het</li>
                    <li>Items verkoop met hoeveelhede en pryse</li>
                    <li>Bekyk, Druk, of Kanselleer knoppies vir elke verkoop</li>
                  </ul>
                </div>

                <Separator className="bg-gray-700" />

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Kanselleer Verkope (Slegs Bestuur)</h3>
                  <p>Bestuurgebruikers kan verkope kanselleer met behoorlike dokumentasie:</p>
                  <ol className="list-decimal list-inside space-y-2 ml-4 mt-2">
                    <li>Klik die "Kanselleer" knoppie op enige verkoop</li>
                    <li>Voer 'n gedetailleerde rede vir kansellasie in</li>
                    <li>Bevestig die aksie</li>
                    <li>Verkoop word gemerk as gekanselleerd (vertoon met rooi deurstreep)</li>
                    <li>Gekanselleerde verkope word uitgesluit van inkomste berekeninge</li>
                    <li>Voorraad word herstel wanneer 'n verkoop gekanselleer word</li>
                    <li>Kanselleer rede word gestoor en is sigbaar</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Usage Tab */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="bg-gray-800/50 backdrop-blur-xl border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white text-2xl">
                  <CreditCard className="mr-3 h-6 w-6 text-[hsl(217,90%,40%)]" />
                  Gebruik Oortjie
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Verstaan Gebruik Fakturering</h3>
                  <p>Storm POS hef 'n klein 0.5% fooi op jou verkope inkomste:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>Betaal net vir wat jy verkoop</li>
                    <li>Geen versteekte fooie of verrassings koste nie</li>
                    <li>Deursigtige fakturering gebaseer op werklike verkope volume</li>
                  </ul>
                </div>

                <Separator className="bg-gray-700" />

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Huidige Periode</h3>
                  <p>Bekyk jou faktureringsinligting vir die huidige maand:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li><strong>Totale Verkope:</strong> Inkomste van alle voltooide verkope hierdie maand</li>
                    <li><strong>Gebruik Fooi (0.5%):</strong> Berekende fooi gebaseer op verkope</li>
                    <li><strong>Fakturering Periode:</strong> Eerste tot laaste dag van huidige maand</li>
                  </ul>
                </div>

                <Separator className="bg-gray-700" />

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Wat Ingesluit is</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Volle toegang tot Storm POS stelsel</li>
                    <li>Onbeperkte gebruikers en produkte</li>
                    <li>Wolk-gebaseerde data berging en rugsteun</li>
                    <li>Kwitansie personalisering</li>
                    <li>Verkope ontleding en verslagdoening</li>
                    <li>Kliënt en voorraadbestuur</li>
                    <li>Gereelde opdaterings en verbeterings</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Staff Accounts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="bg-gray-800/50 backdrop-blur-xl border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white text-2xl">
                  <User className="mr-3 h-6 w-6 text-[hsl(217,90%,40%)]" />
                  Personeel Rekening Stelsel
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Skep Personeel Rekeninge</h3>
                  <ol className="list-decimal list-inside space-y-2 ml-4">
                    <li>Klik die Personeel aftreklys in die opskrif</li>
                    <li>Kies "Skep Nuwe Gebruiker"</li>
                    <li>Voer personeelbesonderhede in:
                      <ul className="list-disc list-inside ml-6 mt-1">
                        <li><strong>Vertoon Naam:</strong> Verskyn op kwitansies en verslae</li>
                        <li><strong>Gebruikersnaam:</strong> Vir aanmelding</li>
                        <li><strong>Wagwoord:</strong> Veilige wagwoord vir die personeellid</li>
                        <li><strong>Gebruiker Tipe:</strong> Personeel of Bestuur</li>
                      </ul>
                    </li>
                    <li>Klik "Skep Personeel Rekening"</li>
                  </ol>
                </div>

                <Separator className="bg-gray-700" />

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Gebruiker Tipes</h3>
                  <div className="space-y-3 ml-4">
                    <div>
                      <p className="font-semibold text-blue-400">Personeel Gebruikers</p>
                      <ul className="list-disc list-inside ml-4">
                        <li>Kan toegang verkry: Verkope, Kliënte, en Oop Rekeninge oortjies</li>
                        <li>Kan nie Produkte of Verslae sonder bestuurswagwoord toegang nie</li>
                        <li>Ideaal vir kassiers, kelners, en voorkant personeel</li>
                        <li>Hul naam verskyn op alle verkope wat hulle verwerk</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-green-400">Bestuur Gebruikers</p>
                      <ul className="list-disc list-inside ml-4">
                        <li>Volle toegang tot alle oortjies en funksies</li>
                        <li>Kan verkope kanselleer en gedetailleerde verslae sien</li>
                        <li>Kan ander personeelrekeninge bestuur</li>
                        <li>Geskik vir eienaars, bestuurders, en toesighouers</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Separator className="bg-gray-700" />

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Personeel Werkvloei</h3>
                  <ol className="list-decimal list-inside space-y-2 ml-4">
                    <li>Personeellid kies hul naam uit die aftreklys</li>
                    <li>Voer hul wagwoord in om aan te meld</li>
                    <li>Verwerk verkope onder hul naam</li>
                    <li>Al hul verkope word naspoor met "Bedien deur: [Naam]" op kwitansies</li>
                    <li>Bestuur kan sien wie elke verkoop in Verslae verwerk het</li>
                  </ol>
                </div>

                <Separator className="bg-gray-700" />

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Bestuur Wagwoord</h3>
                  <p>Personeelgebruikers wat probeer om Produkte of Verslae oortjies te toegang sal gevra word vir die bestuurswagwoord (verstek: manager123):</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>Eenmalige inskrywing verleen tydelike toegang</li>
                    <li>Toegang verval wanneer oortjies of gebruikers verwissel</li>
                    <li>Voorkom ongemagtigde produk of pryse veranderinge</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Receipt Customization */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="bg-gray-800/50 backdrop-blur-xl border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white text-2xl">
                  <Receipt className="mr-3 h-6 w-6 text-[hsl(217,90%,40%)]" />
                  Kwitansie Personalisering
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Toegang Kwitansie Instellings</h3>
                  <ol className="list-decimal list-inside space-y-1 ml-4">
                    <li>Klik jou profielprent in die regter bokant</li>
                    <li>Kies "Personaliseer Jou Kwitansie"</li>
                    <li>Die kwitansie personaliseerder dialoog maak oop</li>
                  </ol>
                </div>

                <Separator className="bg-gray-700" />

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Afdeling Volgorde</h3>
                  <p>Personaliseer die volgorde van kwitansie afdelings:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>Gebruik op/af pyltjie knoppies om afdelings te herposisioneer</li>
                    <li>Afdelings: Logo, Besigheidsinligting, Datum & Tyd, Personeel Inligting, Kliënt Inligting, Items, Totale, Betaling Inligting, Boodskappe</li>
                    <li>Skakel afdelings aan/af om hulle te wys of te versteek</li>
                  </ul>
                </div>

                <Separator className="bg-gray-700" />

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Logo Oplaai</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Laai 'n pasgemaakte kwitansie logo op (PNG, JPG, maks 2MB)</li>
                    <li>Logo vertoon teen 60x60mm, gesentreer op kwitansies</li>
                    <li>Vierkant beelde werk beste</li>
                    <li>Verskillend van profielprent - spesifiek vir kwitansies</li>
                  </ul>
                </div>

                <Separator className="bg-gray-700" />

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Besigheidsinligting</h3>
                  <p>Konfigureer wat op jou kwitansies verskyn:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li><strong>Besigheidsnaam:</strong> Jou maatskappy naam</li>
                    <li><strong>Telefoonnommer:</strong> Kliëntediens kontak</li>
                    <li><strong>Adres:</strong> Twee lyne vir volle adres</li>
                    <li><strong>E-pos & Webwerf:</strong> Aanlyn kontakinligting</li>
                    <li><strong>Registrasienommer:</strong> Besigheid registrasie</li>
                    <li><strong>BTW Nommer:</strong> Belasting identifikasie</li>
                    <li>Elke veld het 'n aan/af skakelaar om sigbaarheid te beheer</li>
                  </ul>
                </div>

                <Separator className="bg-gray-700" />

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Vertoon Opsies</h3>
                  <p>Wys of versteek kwitansie elemente:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>Logo vertoon</li>
                    <li>Datum en tyd stempel</li>
                    <li>Personeellid inligting</li>
                    <li>Kliënt besonderhede</li>
                    <li>Betaalmetode</li>
                  </ul>
                </div>

                <Separator className="bg-gray-700" />

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Pasgemaakte Boodskappe</h3>
                  <p>Voeg persoonlike boodskappe by kwitansies:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li><strong>Kopskrif Boodskap:</strong> Verskyn aan die bo (bv. "Welkom! Spesiale aanbiedinge vandag...")</li>
                    <li><strong>Dankie Boodskap:</strong> Na verkoop besonderhede (bv. "Dankie vir jou besigheid!")</li>
                    <li><strong>Voetskrif Boodskap:</strong> Aan die onderkant (bv. "Besoek ons weer! Terugsendings aanvaar binne 30 dae...")</li>
                    <li>Elke boodskap het 'n aan/af skakelaar</li>
                  </ul>
                </div>

                <Separator className="bg-gray-700" />

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Stoor Veranderinge</h3>
                  <p>Klik "Stoor Instellings" om alle personaliseings toe te pas. Jou instellings word gestoor na die databasis en geld vir alle toekomstige kwitansies.</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Profile Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Card className="bg-gray-800/50 backdrop-blur-xl border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white text-2xl">
                  <Settings className="mr-3 h-6 w-6 text-[hsl(217,90%,40%)]" />
                  Profiel Instellings
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Profielprent</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Klik jou profiel ikoon in die regter bokant</li>
                    <li>Kies "Verander Profielprent"</li>
                    <li>Laai 'n beeld op (PNG, JPG, maks 2MB)</li>
                    <li>Hierdie is jou maatskappy logo wat regdeur die stelsel gewys word</li>
                  </ul>
                </div>

                <Separator className="bg-gray-700" />

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Taal Instellings</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Klik profiel kieslys → "Skakel na Engels"</li>
                    <li>Hele stelsel vertaal na Engels</li>
                    <li>Alle funksies bly identies</li>
                    <li>Skakel enige tyd terug van profiel kieslys</li>
                  </ul>
                </div>

                <Separator className="bg-gray-700" />

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Afmeld</h3>
                  <p>Om uit jou rekening te teken:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-4 mt-2">
                    <li>Klik jou profiel ikoon</li>
                    <li>Kies "Afmeld"</li>
                    <li>Jy sal teruggestuur word na die aanmeld skerm</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Need More Help */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <Card className="bg-white border-[hsl(217,90%,40%)]">
              <CardContent className="p-6">
                <div className="text-center">
                  <HelpCircle className="h-12 w-12 text-[hsl(217,90%,40%)] mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Benodig Meer Hulp?</h3>
                  <p className="text-gray-700 mb-4">
                    As jy vrae het wat nie in hierdie gids gedek word nie, <a href="mailto:softwarebystorm@gmail.com" className="text-[hsl(217,90%,40%)] underline hover:text-[hsl(217,90%,35%)]">kontak asseblief Storm ondersteuning</a> vir bystand.
                  </p>
                  <p className="text-gray-600 text-sm">
                    Hierdie hulpsentrum dek alle funksies beskikbaar in Storm POS. Verken elke afdeling om 'n POS kenner te word!
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Back to Top Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="mt-8 text-center"
        >
          <Button
            variant="outline"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="border-[hsl(217,90%,40%)] text-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,40%)] hover:text-white"
          >
            Terug na Bo
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

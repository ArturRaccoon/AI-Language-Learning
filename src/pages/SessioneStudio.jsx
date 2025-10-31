/**
 * FILE: src/pages/SessioneStudio.jsx
 * DATA CREAZIONE: 2024-12-26 00:30
 * DESCRIZIONE: Pagina sessione di studio con Spaced Repetition
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAutenticazione } from '../contexts/AutenticazioneContext';
import { ottieniFlashcardPerRevisione, registraRevisione } from '../services/flashcardService';
import FlashcardRevisione from '../components/FlashcardRevisione';
import './SessioneStudio.css';

function SessioneStudio() {
    const { utenteCorrente, logout } = useAutenticazione();
    const naviga = useNavigate();

    // Stati sessione
    const [flashcards, setFlashcards] = useState([]);
    const [indiceCorrente, setIndiceCorrente] = useState(0);
    const [caricamento, setCaricamento] = useState(true);
    const [errore, setErrore] = useState('');

    // Stati completamento
    const [sessioneCompletata, setSessioneCompletata] = useState(false);
    const [cardRevisionate, setCardRevisionate] = useState(0);

    /**
     * Carica flashcard da studiare
     */
    useEffect(() => {
        if (!utenteCorrente) return;

        caricaFlashcard();
    }, [utenteCorrente]);

    async function caricaFlashcard() {
        console.log('📚 Caricamento sessione di studio...');
        setCaricamento(true);
        setErrore('');

        try {
            const risultato = await ottieniFlashcardPerRevisione(utenteCorrente.uid, 20);

            if (risultato.successo) {
                setFlashcards(risultato.dati);

                if (risultato.dati.length === 0) {
                    console.log('✅ Nessuna card da rivedere oggi!');
                    setSessioneCompletata(true);
                } else {
                    console.log(`📖 ${risultato.dati.length} card caricate`);
                }
            } else {
                setErrore('Errore nel caricamento delle flashcard');
            }
        } catch (err) {
            console.error('❌ Errore caricamento:', err);
            setErrore('Si è verificato un errore. Riprova.');
        } finally {
            setCaricamento(false);
        }
    }

    /**
     * Gestisce valutazione card
     */
    async function gestisciValutazione(idCard, qualita) {
        console.log('⭐ Valutazione card:', idCard, 'Qualità:', qualita);

        try {
            // Registra revisione con algoritmo SRS
            const risultato = await registraRevisione(idCard, qualita);

            if (risultato.successo) {
                console.log('✅ Revisione registrata');
                console.log('  - Prossima revisione:', risultato.prossimaRevisione);
                console.log('  - Intervallo:', risultato.intervallo, 'giorni');
                console.log('  - Livello:', risultato.livelloConoscenza);

                // Incrementa contatore
                setCardRevisionate(prev => prev + 1);

                // Passa alla card successiva
                if (indiceCorrente < flashcards.length - 1) {
                    console.log('➡️ Prossima card...');
                    setIndiceCorrente(prev => prev + 1);
                } else {
                    console.log('🎉 Sessione completata!');
                    setSessioneCompletata(true);
                }
            } else {
                console.error('❌ Errore registrazione:', risultato.errore);
                alert('Errore nel salvataggio. Riprova.');
            }
        } catch (err) {
            console.error('❌ Errore valutazione:', err);
            alert('Si è verificato un errore. Riprova.');
        }
    }

    /**
     * Logout
     */
    async function gestisciLogout() {
        await logout();
        naviga('/login');
    }

    /**
     * Torna alla dashboard
     */
    function tornaDashboard() {
        naviga('/home');
    }

    // Card corrente
    const cardCorrente = flashcards[indiceCorrente];

    return (
        <div className="sessione-studio-container">
            {/* HEADER */}
            <header className="sessione-studio-header">
                <button onClick={tornaDashboard} className="btn-back">
                    ← Dashboard
                </button>
                <h1>📚 Sessione di Studio</h1>
                <button onClick={gestisciLogout} className="btn-logout-small">
                    Logout
                </button>
            </header>

            <main className="sessione-studio-main">
                {/* LOADING */}
                {caricamento && (
                    <div className="caricamento">
                        <div className="spinner"></div>
                        <p>Caricamento flashcard...</p>
                    </div>
                )}

                {/* ERRORE */}
                {errore && !caricamento && (
                    <div className="alert-errore-grande">
                        <p>{errore}</p>
                        <button onClick={caricaFlashcard} className="btn-riprova">
                            Riprova
                        </button>
                    </div>
                )}

                {/* SESSIONE COMPLETATA */}
                {sessioneCompletata && !caricamento && !errore && (
                    <div className="sessione-completata">
                        <div className="completata-icon">🎉</div>
                        <h2>Sessione Completata!</h2>
                        <p className="completata-stats">
                            {cardRevisionate > 0 ? (
                                <>
                                    Hai studiato <strong>{cardRevisionate}</strong> flashcard{cardRevisionate !== 1 ? 's' : ''}
                                </>
                            ) : (
                                <>
                                    Non ci sono flashcard da rivedere oggi.<br />
                                    Ottimo lavoro! 🌟
                                </>
                            )}
                        </p>
                        <div className="completata-actions">
                            <button onClick={tornaDashboard} className="btn-dashboard">
                                Torna alla Dashboard
                            </button>
                        </div>

                        {cardRevisionate > 0 && (
                            <div className="completata-motivazione">
                                <p>💪 La costanza è la chiave del successo!</p>
                                <p>Torna domani per continuare il tuo percorso di apprendimento.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* SESSIONE ATTIVA */}
                {!caricamento && !errore && !sessioneCompletata && flashcards.length > 0 && (
                    <>
                        {/* PROGRESS BAR */}
                        <div className="progress-container">
                            <div className="progress-info">
                                <span className="progress-label">Progresso</span>
                                <span className="progress-count">
                                    {indiceCorrente + 1} / {flashcards.length}
                                </span>
                            </div>
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${((indiceCorrente + 1) / flashcards.length) * 100}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* FLASHCARD CORRENTE */}
                        {cardCorrente && (
                            <FlashcardRevisione
                                card={cardCorrente}
                                onValutazione={gestisciValutazione}
                            />
                        )}

                        {/* AZIONI AGGIUNTIVE */}
                        <div className="azioni-sessione">
                            <button
                                onClick={tornaDashboard}
                                className="btn-interrompi"
                            >
                                Interrompi Sessione
                            </button>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}

export default SessioneStudio;
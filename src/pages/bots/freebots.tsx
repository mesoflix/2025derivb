import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/hooks/useStore';
import { LabelPairedFileArrowDownCaptionRegularIcon } from '@deriv/quill-icons/LabelPaired';
import { LabelPairedMoonCaptionRegularIcon } from '@deriv/quill-icons/LabelPaired';
import { LabelPairedExclamationCaptionRegularIcon } from '@deriv/quill-icons/LabelPaired';
import { Localize } from '@deriv-com/translations';
// Import the XML files directly
import x1 from './bot-files/$Orginal DollarPrinterBot  2025 Version $.xml'; // Correct the import statement
import x2 from './bot-files/⚡ ProfitMax Encroach Trader 💵.xml';
import x3 from './bot-files/Alpha Version 2025.xml';
import './freebots.scss';

const FreeBots = observer(() => {
    const { load_modal, dashboard, blockly_store } = useStore();
    const { handleFileChange } = load_modal;
    const [loadingBotId, setLoadingBotId] = useState<number | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);

    // Map filenames to their XML content
    const botXmlMap: Record<string, string> = {
        '$Orginal DollarPrinterBot  2025 Version $.xml': x1,
        '⚡ ProfitMax Encroach Trader 💵.xml': x2,
        'Alpha Version 2025.xml': x3,
    };

    const bots = [
        {
            name: '$Orginal DollarPrinterBot  2025 Version $',
            description: 'Some description some description some description',
            file: '$Orginal DollarPrinterBot  2025 Version $.xml',
            icon: '🤖',
        },
        {
            name: '⚡ ProfitMax Encroach Trader 💵',
            description: 'Some description some description some description',
            file: '⚡ ProfitMax Encroach Trader 💵.xml',
            icon: '📈',
        },
        {
            name: 'Alpha Version 2025',
            description: 'Some description some description some description',
            file: 'Alpha Version 2025.xml',
            icon: '💹',
        },
    ];

    const handleBotSelect = (filename: string, botIndex: number) => {
        // Reset any previous errors
        setLoadError(null);
        // Set loading state for this specific bot
        setLoadingBotId(botIndex);

        // Set the dashboard tab to Bot Builder (tab index 1)
        dashboard.setActiveTab(1);

        // Get the XML content for this bot
        const xmlContent = botXmlMap[filename];

        if (!xmlContent) {
            console.error(`XML content not found for ${filename}`);
            setLoadError(`Could not load bot: XML file "${filename}" not found`);
            setLoadingBotId(null);
            return;
        }

        // Wait for Blockly to be fully loaded
        const loadBot = () => {
            // Set a timeout to prevent infinite loops
            let attempts = 0;
            const maxAttempts = 50; // 5 seconds max waiting time

            const tryLoadBot = () => {
                if (!window.Blockly?.derivWorkspace) {
                    attempts++;
                    if (attempts > maxAttempts) {
                        setLoadError('Blockly workspace not available after multiple attempts');
                        setLoadingBotId(null);
                        return;
                    }
                    setTimeout(tryLoadBot, 100);
                    return;
                }

                try {
                    // Validate XML before attempting to load
                    if (!xmlContent.includes('<xml') || !xmlContent.includes('</xml>')) {
                        throw new Error('Invalid XML format');
                    }

                    // Clear existing workspace
                    window.Blockly.derivWorkspace.asyncClear();

                    // Parse the XML and load it into the workspace
                    const xml = window.Blockly.utils.xml.textToDom(xmlContent);
                    window.Blockly.Xml.domToWorkspace(xml, window.Blockly.derivWorkspace);

                    // Save the current workspace for recovery
                    window.Blockly.derivWorkspace.strategy_to_load = xmlContent;

                    // Update UI if needed
                    window.Blockly.derivWorkspace.cleanUp();

                    // Successfully loaded
                    console.log(`Successfully loaded bot: ${filename}`);

                    // Clear loading state
                    setLoadingBotId(null);
                } catch (error) {
                    console.error('Error loading bot:', error);
                    setLoadError(`Failed to load bot: ${error instanceof Error ? error.message : 'Unknown error'}`);
                    setLoadingBotId(null);
                }
            };

            tryLoadBot();
        };

        loadBot();
    };

    useEffect(() => {
        const cards = document.querySelectorAll('.free-bots__card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                (card as HTMLElement).style.opacity = '1';
                (card as HTMLElement).style.transform = 'translateY(0)';
            }, 100 * index);
        });
    }, []);

    return (
        <div className='free-bots'>
            <div className='free-bots__header'>
                <LabelPairedMoonCaptionRegularIcon height='32px' width='32px' fill='var(--button-primary-default)' />
                <h1>Free Trading Bots</h1>
                <p>Select from our collection of high-performance trading bots</p>
            </div>
            {loadError && (
                <div className='free-bots__error-message'>
                    <LabelPairedExclamationCaptionRegularIcon height='20px' width='20px' fill='var(--status-danger)' />
                    <span>{loadError}</span>
                </div>
            )}
            <div className='free-bots__scroll-container'>
                <div className='bot-list-container'>
                    <div className='free-bots__grid'>
                        {bots.map((bot, index) => (
                            <div
                                key={index}
                                className='free-bots__card'
                                style={{
                                    opacity: 0,
                                    transform: 'translateY(20px)',
                                    transition: 'all 0.4s ease-out',
                                }}
                            >
                                <div className='free-bots__card-icon'>{bot.icon}</div>
                                <div className='free-bots__card-content'>
                                    <h3>{bot.name}</h3>
                                    <p>{bot.description}</p>
                                    <button
                                        className={`free-bots__download-btn ${loadingBotId === index ? 'loading' : ''}`}
                                        onClick={() => handleBotSelect(bot.file, index)}
                                        disabled={loadingBotId !== null}
                                    >
                                        {loadingBotId === index ? (
                                            <span>Loading...</span>
                                        ) : (
                                            <>
                                                <LabelPairedFileArrowDownCaptionRegularIcon
                                                    height='16px'
                                                    width='16px'
                                                />
                                                <span>Load Bot</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
});

export default FreeBots;

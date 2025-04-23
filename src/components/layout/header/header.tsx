import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import { standalone_routes } from '@/components/shared';
import Button from '@/components/shared_ui/button';
import useActiveAccount from '@/hooks/api/account/useActiveAccount';
import useIsGrowthbookIsLoaded from '@/hooks/growthbook/useIsGrowthbookLoaded';
import { useApiBase } from '@/hooks/useApiBase';
import { useStore } from '@/hooks/useStore';
import { StandaloneCircleUserRegularIcon } from '@deriv/quill-icons/Standalone';
import { requestOidcAuthentication } from '@deriv-com/auth-client';
import { Localize, useTranslations } from '@deriv-com/translations';
import { Header, useDevice, Wrapper } from '@deriv-com/ui';
import { Tooltip } from '@deriv-com/ui';
import { isDotComSite } from '../../../utils';
import { AppLogo } from '../app-logo';
import AccountsInfoLoader from './account-info-loader';
import AccountSwitcher from './account-switcher';
import MenuItems from './menu-items';
import MobileMenu from './mobile-menu';
import PlatformSwitcher from './platform-switcher';
import './header.scss';

// SBS imports
import { ArrowDownCircle, ArrowUpCircle, Mail } from 'lucide-react';
import { useState } from 'react';
import { Menu } from 'lucide-react'; // Import Menu icon

const AppHeader = observer(() => {
    const { isGBLoaded, isGBAvailable } = useIsGrowthbookIsLoaded();
    const { isDesktop } = useDevice();
    const { isAuthorizing, activeLoginid } = useApiBase();
    const { client } = useStore() ?? {};

    const { data: activeAccount } = useActiveAccount({ allBalanceData: client?.all_accounts_balance });
    const { accounts, getCurrency } = client ?? {};
    const has_wallet = Object.keys(accounts ?? {}).some(id => accounts?.[id].account_category === 'wallet');

    const currency = getCurrency?.();
    const { localize } = useTranslations();

    const [isMenuOpen, setIsMenuOpen] = useState(false); // Track menu state

    const renderAccountSection = () => {
        if (isAuthorizing) {
            return <AccountsInfoLoader isLoggedIn isMobile={!isDesktop} speed={3} />;
        } else if (activeLoginid) {
            return (
                <>
                    {/* <CustomNotifications /> */}
                    {isDesktop &&
                        (() => {
                            const redirect_url = new URL(standalone_routes.personal_details);
                            const urlParams = new URLSearchParams(window.location.search);
                            const account_param = urlParams.get('account');
                            const is_virtual = client?.is_virtual || account_param === 'demo';

                            if (is_virtual) {
                                redirect_url.searchParams.set('account', 'demo');
                            } else if (currency) {
                                redirect_url.searchParams.set('account', currency);
                            }
                            return (
                                <Tooltip
                                    as='a'
                                    href={redirect_url.toString()}
                                    tooltipContent={localize('Manage account settings')}
                                    tooltipPosition='bottom'
                                    className='app-header__account-settings'
                                >
                                    <StandaloneCircleUserRegularIcon className='app-header__profile_icon' />
                                </Tooltip>
                            );
                        })()}
                    <AccountSwitcher activeAccount={activeAccount} />
                    {isDesktop &&
                        (has_wallet ? (
                            <Button
                                className='manage-funds-button'
                                has_effect
                                text={localize('Manage funds')}
                                onClick={() => {
                                    let redirect_url = new URL(standalone_routes.wallets_transfer);

                                    if (isGBAvailable && isGBLoaded) {
                                        redirect_url = new URL(standalone_routes.recent_transactions);
                                    }

                                    if (currency) {
                                        redirect_url.searchParams.set('account', currency);
                                    }
                                    window.location.assign(redirect_url.toString());
                                }}
                                primary
                            />
                        ) : (
                            <Button
                                primary
                                onClick={() => {
                                    const redirect_url = new URL(standalone_routes.cashier_deposit);
                                    if (currency) {
                                        redirect_url.searchParams.set('account', currency);
                                    }
                                    window.location.assign(redirect_url.toString());
                                }}
                                className='deposit-button'
                            >
                                {localize('Deposit')}
                            </Button>
                        ))}
                </>
            );
        } else {
            return (
                <div className='auth-actions'>
                    <Button
                        tertiary
                        onClick={async () => {
                            window.location.href = 'https://oauth.deriv.com/oauth2/authorize?app_id=71895&l=EN&brand=deriv';
                        }}
                    >
                        <Localize i18n_default_text='Log in' />
                    </Button>
                    <Button
                        primary
                        onClick={() => {
                            window.open(standalone_routes.signup);
                        }}
                    >
                        <Localize i18n_default_text='Sign up' />
                    </Button>
                </div>
            );
        }
    };

    return (
        <Header
            className={clsx('app-header', {
                'app-header--desktop': isDesktop,
                'app-header--mobile': !isDesktop,
            })}
        >
            <Wrapper variant='left'>
                <h1 className='app-header__logo'>
                    <span className='logo__sbs'>SBS</span><span className='logo__matthie'>MATTHIE</span>
                </h1>
                {isDesktop ? (
                    <div className='mobile-menu'>
                        <button onClick={() => window.location.href = '/withdraw'}>
                            <ArrowUpCircle className='mobile-menu__icon' />
                            Withdraw
                        </button>
                        <button onClick={() => window.location.href = '/deposit'}>
                            <ArrowDownCircle className='mobile-menu__icon' />
                            Deposit
                        </button>
                        <button onClick={() => window.location.href = '/contact'}>
                            <Mail className='mobile-menu__icon' />
                            Contact
                        </button>
                    </div>
                ) : (
                    <div className='mobile-menu-icon'>
                        <Menu onClick={() => {
                            alert('hhhhh'); // Check if this alert is triggered
                            setIsMenuOpen(!isMenuOpen); // Toggle menu state
                        }} className='mobile-menu-icon__button' />
                    </div>
                )}

                {/* Added background and border for debugging */}
                {isMenuOpen && !isDesktop && (
                    <div className='mobile-menu' style={{ background: 'rgba(0, 0, 0, 0.7)', border: '2px solid red' }}>
                        <button onClick={() => {
                            alert('Withdraw clicked');
                            window.location.href = '/withdraw';
                        }}>
                            <ArrowUpCircle className='mobile-menu__icon' />
                            Withdraw
                        </button>
                        <button onClick={() => {
                            alert('Deposit clicked');
                            window.location.href = '/deposit';
                        }}>
                            <ArrowDownCircle className='mobile-menu__icon' />
                            Deposit
                        </button>
                        <button onClick={() => {
                            alert('Contact clicked');
                            window.location.href = '/contact';
                        }}>
                            <Mail className='mobile-menu__icon' />
                            Contact
                        </button>
                    </div>
                )}
            </Wrapper>
            <Wrapper variant='right'>{renderAccountSection()}</Wrapper>
        </Header>
    );
});

export default AppHeader;

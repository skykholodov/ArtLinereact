import { useState, useEffect } from 'react';
import Joyride, { STATUS, Step, CallBackProps } from 'react-joyride';
import { useLanguage } from '@/hooks/use-language';
import { translate } from '@/lib/i18n';

// Интерфейс для хранения состояния онбординга
interface OnboardingWalkthroughProps {
  skipCallback?: () => void;
}

export default function OnboardingWalkthrough({ skipCallback }: OnboardingWalkthroughProps) {
  const { language } = useLanguage();
  const [run, setRun] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);

  // Загрузка состояния онбординга из localStorage
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding) {
      setTimeout(() => {
        setRun(true);
      }, 1000); // Небольшая задержка для загрузки страницы
    }
  }, []);

  // Создание шагов на основе языка
  useEffect(() => {
    const newSteps: Step[] = [
      {
        target: 'body',
        placement: 'center',
        title: translate('onboarding.welcome', language),
        content: translate('onboarding.welcomeMessage', language),
        disableBeacon: true,
      },
      {
        target: '#services',
        content: translate('onboarding.servicesMessage', language),
        title: translate('onboarding.services', language),
        disableBeacon: true,
      },
      {
        target: '#portfolio',
        content: translate('onboarding.portfolioMessage', language),
        title: translate('onboarding.portfolio', language),
        disableBeacon: true,
      },
      {
        target: '#about',
        content: translate('onboarding.aboutMessage', language),
        title: translate('onboarding.about', language),
        disableBeacon: true,
      },
      {
        target: '#contacts',
        content: translate('onboarding.contactsMessage', language),
        title: translate('onboarding.contacts', language),
        disableBeacon: true,
      },
      {
        target: '.language-dropdown',
        content: translate('onboarding.langSwitcherMessage', language),
        title: translate('onboarding.langSwitcher', language),
        disableBeacon: true,
      },
      {
        target: 'body',
        placement: 'center',
        title: translate('onboarding.last', language),
        content: translate('onboarding.lastMessage', language),
        disableBeacon: true,
      },
    ];

    setSteps(newSteps);
  }, [language]);

  // Обработка шагов онбординга
  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type } = data;
    
    if (([STATUS.FINISHED, STATUS.SKIPPED] as string[]).includes(status)) {
      // Сохраняем состояние, что пользователь уже видел онбординг
      localStorage.setItem('hasSeenOnboarding', 'true');
      setRun(false);
      
      if (skipCallback && status === STATUS.SKIPPED) {
        skipCallback();
      }
    }
  };

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous
      hideCloseButton
      run={run}
      scrollToFirstStep
      showProgress
      showSkipButton
      steps={steps}
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: '#E74C3C',
          arrowColor: '#fff',
          backgroundColor: '#fff',
          textColor: '#333',
          overlayColor: 'rgba(0, 0, 0, 0.5)',
        },
        buttonNext: {
          backgroundColor: '#E74C3C',
          color: '#fff',
          fontSize: '14px',
        },
        buttonBack: {
          color: '#2C3E50',
          fontSize: '14px',
        },
        buttonSkip: {
          color: '#555',
          fontSize: '14px',
        },
        spotlight: {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
        },
      }}
      locale={{
        back: translate('onboarding.prev', language),
        close: translate('onboarding.finish', language),
        last: translate('onboarding.finish', language),
        next: translate('onboarding.next', language),
        skip: translate('onboarding.skip', language),
      }}
    />
  );
}
import Component from '@glimmer/component';

export default class WalkthroughPhoneComponent extends Component {
  capabilities = [
    {
      id: 'fastNavigation',
      label: 'Fast navigation',
      description:
        'I am open to playing games where being able to navigate the app interface quickly is an advantage.',
    },
  ];
}

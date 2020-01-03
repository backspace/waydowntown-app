import Component from '@glimmer/component';

export default class WalkthroughPhysicalComponent extends Component {
  capabilities = [
    {
      id: 'exertion',
      label: 'Exertion',
      description:
        'I can sustain physical exertion for a medium-term period, such as climbing two flights of stairs (? how to ask this without presuming stairs access)',
    },
    {
      id: 'height',
      label: 'Height',
      description:
        'I can see and reach toward things that are around 2m or 6.5′ from the ground.',
    },
    {
      id: 'scents',
      label: 'Scents',
      description:
        'I can be in spaces that have strong scents, such as those of cleaning products.',
    },
    {
      id: 'speed',
      label: 'Speed',
      description:
        'I am open to playing games where moving quickly around a space is an advantage.',
    },
    {
      id: 'stairs',
      label: 'Stairs',
      description: 'I can travel up or down stairs to access spaces.',
    },
  ];
}

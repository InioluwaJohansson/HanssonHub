import { ChatDto, MessageDto, MessageType, Role } from './types';
import { INITIAL_USER, INITIAL_USERS } from './constants';

export const INITIAL_CHATS: ChatDto[] = [
  {
    id: 1,
    name: 'Home Hub',
    description: 'Central communication for HansonHub services',
    isGroup: true,
    imageUrl: 'https://picsum.photos/seed/home/100/100',
    createdAt: new Date().toISOString(),
    unreadCount: 0,
    participants: INITIAL_USERS.map(u => ({
      personId: u.id,
      fullName: `${u.getPersonDetailsDto.firstName} ${u.getPersonDetailsDto.lastName}`,
      profileImageUrl: u.getPersonDetailsDto.imageUrl,
      isAdmin: u.getUserDto.role === Role.Owner,
      isOnline: !u.disabled
    }))
  },
  {
    id: 2,
    name: 'Jane Doe',
    isGroup: false,
    imageUrl: 'https://picsum.photos/seed/jane/100/100',
    createdAt: new Date().toISOString(),
    unreadCount: 2,
    participants: [
      {
        personId: INITIAL_USER.id,
        fullName: `${INITIAL_USER.getPersonDetailsDto.firstName} ${INITIAL_USER.getPersonDetailsDto.lastName}`,
        profileImageUrl: INITIAL_USER.getPersonDetailsDto.imageUrl,
        isAdmin: true,
        isOnline: true
      },
      {
        personId: 2,
        fullName: 'Jane Doe',
        profileImageUrl: 'https://picsum.photos/seed/jane/100/100',
        isAdmin: false,
        isOnline: true
      }
    ]
  }
];

export const INITIAL_CHAT_MESSAGES: MessageDto[] = [
  {
    id: 1,
    chatId: 1,
    senderPersonId: 1,
    senderName: 'Inioluwa Makinde',
    content: 'Welcome to the Home Hub!',
    type: MessageType.Text,
    isEdited: false,
    isDeleted: false,
    sentAt: new Date(Date.now() - 3600000).toISOString(),
    attachments: []
  },
  {
    id: 2,
    chatId: 2,
    senderPersonId: 2,
    senderName: 'Jane Doe',
    content: 'Did you lock the front door?',
    type: MessageType.Text,
    isEdited: false,
    isDeleted: false,
    sentAt: new Date(Date.now() - 1800000).toISOString(),
    attachments: []
  },
  {
    id: 3,
    chatId: 2,
    senderPersonId: 1,
    senderName: 'Inioluwa Makinde',
    content: 'Yes, it is locked.',
    type: MessageType.Text,
    isEdited: false,
    isDeleted: false,
    sentAt: new Date(Date.now() - 900000).toISOString(),
    attachments: []
  }
];

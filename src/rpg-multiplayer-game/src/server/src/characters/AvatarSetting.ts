export interface AvatarSetting {
  name: string
  body: {
    sizeFactor: number
    size: {
      width: number
      height: number
      center?: boolean | undefined
    }
    offset: {
      width: number
      height: number
    }
  }
}

// const factorize = (avatarSetting: AvatarSetting, n: number) => avatarSetting.body.sizeFactor * n

export const avatarSettings: AvatarSetting[] = [
  {
    name: 'fauna',
    body: {
      sizeFactor: 32,
      size: {
        width: 0.41,
        height: 0.4,
        center: false,
      },
      offset: {
        width: 0.31,
        height: 0.45,
      },
    },
  },
]

export const noOpAvatar: AvatarSetting = {
  name: '',
  body: {
    sizeFactor: 0,
    size: {
      width: 0,
      height: 0,
      center: false,
    },
    offset: {
      width: 0,
      height: 0,
    }
  }
}

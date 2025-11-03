const images = import.meta.glob('./*.{png,jpg,jpeg,svg}', { eager: true });

export const avatars = Object.fromEntries(
    Object.entries(images).map(([path, module]) => {
        const fileName = path.split('/').pop();
        return [fileName, module.default];
    })
);

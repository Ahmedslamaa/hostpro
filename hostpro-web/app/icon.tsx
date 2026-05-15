// Skip dynamic icon generation for Electron builds
// Use static icon.png from public folder instead
export const dynamic = 'force-static';

export default function Icon() {
  return new Response('Use static icon from public/', {
    status: 404,
  });
}

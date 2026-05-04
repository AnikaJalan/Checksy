import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8">
      <div className="mb-8 flex items-center space-x-2">
        <span className="text-2xl font-medium tracking-wide text-amber-500">Checksy</span>
      </div>
      <SignUp 
         routing="path"
         path="/sign-up"
         fallbackRedirectUrl="/dashboard"
         forceRedirectUrl="/dashboard"
         appearance={{ 
           variables: { colorPrimary: '#f59e0b', colorBackground: '#09090b', colorText: '#f8fafc', colorInputBackground: '#18181b', colorInputText: '#fff' },
           elements: { card: 'border border-white/10 shadow-2xl rounded-sm !bg-[#09090b]' }
         }} 
      />
    </div>
  );
}

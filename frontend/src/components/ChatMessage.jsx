export default function ChatMessage({ sender, text }) {
  const isUser = sender === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={[
          'max-w-[90%] rounded-[24px] px-4 py-3 text-sm leading-6 shadow-sm sm:max-w-[78%]',
          isUser
            ? 'rounded-br-md border border-blue-200 bg-blue-600 text-white'
            : 'rounded-bl-md border border-slate-200 bg-white text-slate-700',
        ].join(' ')}
      >
        <div
          className={[
            'mb-1 text-[11px] font-semibold uppercase tracking-[0.2em]',
            isUser ? 'text-blue-100' : 'text-slate-400',
          ].join(' ')}
        >
          {isUser ? 'You' : 'AI Assistant'}
        </div>
        {text}
      </div>
    </div>
  )
}

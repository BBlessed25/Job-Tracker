export default function HelpButton(){
    return (
      <button
        aria-label="Help"
        title="Help"
        className="fixed bottom-4 right-4 z-50 grid h-10 w-10 place-content-center rounded-full bg-neutral-900 text-white shadow-lg"
        onClick={()=> alert('Need help? contact support.')}
      >
        ?
      </button>
    )
  }

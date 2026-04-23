import LangSwitcher from './LangSwitcher'

const PublicHeader = () => {
    return (
        <header className="w-full flex justify-end pt-4 px-[1.2rem] pb-0 absolute top-0 right-0 z-[1000]">
            <LangSwitcher />
        </header>
    )
}

export default PublicHeader
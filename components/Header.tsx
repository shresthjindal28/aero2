
export default function Header({content,className}:{
    content:string;
    className:string;
}) {
  return (
    <div className="text-4xl flex justify-center">
        <h2 className={className}>{content}</h2>
    </div>
  )
}

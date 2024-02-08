import React, { ReactNode } from "react"
import '../../assets/css/dashboard.css'

interface CardProps {

    children: ReactNode,
    title: string,
    subtitle: string,
    className?: string,
}

export default function Card(props: CardProps) {

    return (
        <div className={`card col mb-3 ${props.className}`}>
            <div className="card-body">
                <h5 className="card-title">{props.title}</h5>
                <h6 className="card-subtitle mb-2 ">{props.subtitle}</h6>
                <p className="card-text">
                    {props.children}
                </p>
            </div>
            {/* <a href="#" className="card-link">Card link</a>
            <a href="#" className="card-link">Another link</a> */}
        </div>
    )
    return <div className={`${props.className}`}>
        {props.children}
    </div>

}

Card.defaultProps = {
    title: "",
    subtitle: "",
    className: "",
}
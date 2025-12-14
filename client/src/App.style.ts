import styled from 'styled-components'
export const Section = styled.section`
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    min-height: 100vh;
    z-index: 1;
    position: relative;
    font-family: monospace;
    padding: 5vh 0;
    box-sizing: border-box;

    > h2 {
        width: 72%;
        font-size: 36px;
        text-align: center;
        line-height: 54px;
        margin-bottom: 48px;
        &.large {
            font-size: 72px;
            margin-bottom: 0;
        }
    }

    > h3 {
        font-size: 24px;
        line-height: 42px;
        width: 64%;
        margin-bottom: 48px;
        text-align: center;
    }

    b {
        font-weight: bold; 
    }
    
    p {
        font-size: 18px;
        width: 64%;
        line-height: 32px;
        text-align: center;
        margin-bottom: 32px;

        > a {
            display: inline-block;
            border-bottom: 4px dotted #CCC; 
        }
    }

    > div > div {
        text-align: center;
        > h3 {
            margin-bottom: 32px;
            font-weight: bold;
        }
        > p {
            font-size: 18px;
            width: 100%;
            line-height: 32px;
            margin-bottom: 32px;
        }
    }

    > details {
        font-size: 18px;
        width: 64%;
        line-height: 32px;
        text-align: center;
        margin-bottom: 32px;
    }

    ul {
        width: 64%;
        text-align: center;
        margin-bottom: 32px;
        > li {
            font-size: 18px;
            line-height: 32px; 
        }
    }

    i {
        font-style: italic;
    }

    > div {
        font-size: 18px;
        margin-bottom: 24px;
        &.large {
            font-size: 24px;
            margin-bottom: 36px;
        }
    }

    > code {
        margin-bottom: 48px;
        width: 90%;
        text-align: center;
        line-height: 36px;
        font-size: 16px;
    }

    > img {
        margin-bottom: 84px; 
    }

    &.headline {
        color: #FFF;
        > h1 {
            font-family: monospace;
            font-weight: normal;
            font-size: 48px;
            margin-bottom: 24px;
            > a {
                color: rgba(255,255,255,0.8);
                text-decoration: none;
            }
        }

        > p {
            width: 50%; 
        }
        
        > div {
            font-size: 120px;
            margin: 0px 0 60px;
        }
    }
`

export const Graphic = styled.div`
    position: absolute;
    width: 100%;
    height: 100vh;
    background-size: 100% auto;
    background-repeat: no-repeat;
    background-position: center;
`

export const Panel = styled.div`
    position: fixed;
    background-repeat: no-repeat;
    background-size: auto 100%;
    background-position: center;
    height: 100vh;
    width: 100%;
    z-index: 0;
`